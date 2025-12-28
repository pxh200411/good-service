import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Space,
  Divider,
  Spin,
  message,
  Tag,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDemandStore } from "../../store/modules/demandStore";
import { useUserStore } from "../../store/modules/userStore";
import { uploadResponseFile, replaceResponseFile } from "../../api/modules/responseFile";
import FileUploader from "../../components/FileUploader";
import ResponseFileViewer from "../../components/ResponseFileViewer";

const { Title } = Typography;
const { TextArea } = Input;

const IServeResponseForm = () => {
  const { demandId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // 文件上传相关状态
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [shouldDeleteExistingFile, setShouldDeleteExistingFile] = useState(false);

  // 从location.state获取编辑模式和响应数据
  const { isEdit, response } = location.state || {
    isEdit: false,
    response: null,
  };


  // 从userStore获取用户状态
  const { isLoggedIn, userInfo } = useUserStore();

  // 从store获取状态和方法
  const {
    currentDemand,
    loading,
    getDemandById,
    createServiceResponse,
    updateServiceResponse,
  } = useDemandStore();

  

  // 加载需求数据
  useEffect(() => {
    if (demandId) {
      getDemandById(demandId);
    }
  }, [demandId, getDemandById]);

  // 当currentDemand变化时，填充表单数据
  useEffect(() => {
    if (currentDemand) {
        // 检查需求状态，如果不是PUBLISHED，显示提示但允许继续响应
        if (currentDemand.status !== "PUBLISHED") {
        message.info("此需求状态为" + currentDemand.status + "，您仍然可以提交响应");
      }

      // 检查是否已经登录
      if (!isLoggedIn) {
        message.warning("请先登录");
        navigate("/login");
        return;
      }

      // 如果是编辑模式，填充响应数据
      if (isEdit && response) {
        // 检查响应状态，如果不是PENDING，不允许编辑


        form.setFieldsValue({
          title: response.title,
          content: response.content,
        });
      }
    }
  }, [currentDemand, form, navigate, isEdit, response, isLoggedIn]);

  // 返回需求列表
  const handleBack = () => {
    if (isEdit) {
      navigate("/i-serve");
    } else {
      navigate("/demand");
    }
  };

  // 处理文件删除
  const handleDeleteFile = () => {
    setSelectedFile(null);
    setShouldDeleteExistingFile(true);
    message.info('已标记删除现有文件，提交后将移除');
  };

  // 处理文件选择（取消删除标记）
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShouldDeleteExistingFile(false); // 选择新文件时取消删除标记
    message.success('文件已选择，将在提交时上传');
    return Promise.resolve({ success: true, file });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const responseData = {
        demandId,
        title: values.title,
        description: values.content,
      };

      if (isEdit && response) {
        // 修改响应
        try {
          await updateServiceResponse(response.id, responseData);
          //console.log('响应更新成功');
          
          // 处理文件上传/替换
          if (selectedFile) {
            //console.log('[DEBUG] IServeResponseForm: starting file upload for response:', response.id);
            setFileUploading(true);
            
            try {
              // 尝试替换文件，如果不存在则自动上传新文件
              const fileResult = await replaceResponseFile(response.id, selectedFile, {
                onProgress: (progress) => {
                  //console.log('[DEBUG] IServeResponseForm: file upload progress:', progress + '%');
                }
              });
              //console.log('[DEBUG] IServeResponseForm: file upload completed:', fileResult);
              message.success('响应更新成功，文件已更新');
            } catch (fileError) {
              //console.error('[DEBUG] IServeResponseForm: file operation failed:', fileError);
              message.warning('响应更新成功，但文件操作失败，请稍后重试');
            } finally {
              setFileUploading(false);
            }
          } else if (shouldDeleteExistingFile) {
            // 用户选择删除文件但不上传新文件
            message.success('响应更新成功，文件已移除');
          } else {
            message.success('响应更新成功');
          }
          
          // 重置表单
          form.resetFields();
          
          // 导航回列表页面
          navigate("/i-serve");
          
        } catch (error) {
          //console.error('更新响应失败:', error);
          message.error('更新响应失败，请重试');
        }
      } else {
        // 创建新响应
        try {
          const responseResult = await createServiceResponse(responseData);
          //console.log('响应提交成功:', responseResult);
          
          // 处理文件上传
          if (selectedFile) {
            //console.log('[DEBUG] IServeResponseForm: starting file upload for new response:', responseResult.id);
            setFileUploading(true);
            
            try {
              const fileResult = await uploadResponseFile(responseResult.id, selectedFile, {
                onProgress: (progress) => {
                  //console.log('[DEBUG] IServeResponseForm: file upload progress:', progress + '%');
                }
              });
              //console.log('[DEBUG] IServeResponseForm: file upload completed:', fileResult);
              message.success('响应提交成功，文件已上传');
            } catch (fileError) {
              //console.error('[DEBUG] IServeResponseForm: file upload failed:', fileError);
              message.warning('响应提交成功，但文件上传失败，请稍后重试');
            } finally {
              setFileUploading(false);
            }
          } else {
            message.success('响应提交成功');
          }
          
          // 重置表单
          form.resetFields();
          
          // 导航回列表页面
          navigate("/i-serve");
          
        } catch (error) {
          //console.error('提交响应失败:', error);
          message.error('提交响应失败，请重试');
        }
      }
    } catch (errorInfo) {
      if (errorInfo.errorFields) {
        //console.log("表单验证失败:", errorInfo);
        message.error("表单验证失败，请检查填写内容");
      } else {
        //console.log("响应操作失败:", errorInfo);
        message.error("操作失败，请稍后重试");
      }
    }
  };

  // 表单验证规则
  const formRules = {
    title: [
      { required: true, message: "请输入响应标题", trigger: "blur" },
      { max: 50, message: "响应标题不能超过50个字符", trigger: "blur" },
    ],
    content: [
      { required: true, message: "请输入响应内容", trigger: "blur" },
      { max: 500, message: "响应内容不能超过500个字符", trigger: "blur" },
    ],
  };

  // 如果正在加载，显示加载状态
  if (loading && !currentDemand) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          background: "#f0f2f5",
          padding: "20px",
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#f0f2f5" }}>
      {/* 返回按钮和标题 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            返回
          </Button>
        </Col>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {isEdit ? "修改响应" : "响应需求"}
          </Title>
        </Col>
        <Col style={{ width: 100 }}></Col> {/* 占位，保持标题居中 */}
      </Row>

      {/* 需求信息卡片 */}
      {currentDemand && (
        <Card bordered={true} style={{ marginBottom: 24 }}>
          <Title level={4}>需求信息</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
              <strong>需求标题:</strong> {currentDemand.title}
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
              <strong>服务类型:</strong> {currentDemand.type}
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={8}>
              <strong>状态:</strong>{" "}
              <Tag color="default" style={{ backgroundColor: '#f0f0f0' }}>{currentDemand.status}</Tag>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <strong>需求描述:</strong> {currentDemand.description}
            </Col>
          </Row>
        </Card>
      )}

      {/* 表单卡片 */}
      <Card bordered={true}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: "",
            content: "",
          }}
        >
          <Row gutter={[16, 16]}>
            {/* 响应标题 */}
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                name="title"
                label="响应标题"
                rules={formRules.title}
              >
                <Input
                  placeholder="请输入响应标题"
                  maxLength={50}
                  showCount
                />
              </Form.Item>
            </Col>
            
            {/* 响应内容 */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item
                name="content"
                label="响应内容"
                rules={formRules.content}
              >
                <TextArea
                  placeholder="请输入您的响应内容，说明您的服务能力和计划"
                  rows={8}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 文件上传部分 */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item label="附件上传">
                {/* 显示现有文件 - 使用 ResponseFileViewer 组件 */}
                {isEdit && response && !shouldDeleteExistingFile && (
                  <div style={{ marginBottom: 16 }}>
                    <ResponseFileViewer 
                      responseId={response.id} 
                      title="当前响应文件"
                    />
                    {/* 删除文件按钮 */}
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteFile}
                        size="small"
                      >
                        删除现有文件（提交后将移除）
                      </Button>
                    </div>
                  </div>
                )}

                {/* 显示文件已删除的提示 */}
                {isEdit && response && shouldDeleteExistingFile && (
                  <div style={{ 
                    marginBottom: 16, 
                    padding: '16px', 
                    border: '1px dashed #ff4d4f', 
                    borderRadius: '6px',
                    backgroundColor: '#fff2f0',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
                      🗑️ 现有文件已被标记删除
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                      提交后将永久移除文件
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShouldDeleteExistingFile(false)}
                      style={{ padding: 0, height: 'auto', marginTop: 8 }}
                    >
                      取消删除
                    </Button>
                  </div>
                )}
                
                {/* 文件上传组件 */}
                <FileUploader
                  onUpload={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.svg,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
                  maxSize={20 * 1024 * 1024} // 20MB
                  multiple={false}
                  showFileList={true}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  支持上传PDF、Word、Excel、PPT、图片等文件，最大20MB
                  {isEdit && response ? '（上传新文件将替换现有文件）' : ''}
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* 提交按钮 */}
          <Row justify="center">
            <Space size="large">
              <Button type="default" size="large" onClick={handleBack}>
                取消
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={loading || fileUploading}
                onClick={handleSubmit}
              >
                {isEdit ? "保存修改" : "提交响应"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>

      {/* 表单说明 */}
      <Row justify="center" style={{ marginTop: 24 }}>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={24}
          xl={24}
          style={{ textAlign: "center" }}
        >
          <Typography.Text type="secondary">
            {isEdit
              ? "修改响应信息后点击保存按钮，将更新到系统中"
              : "填写响应内容后点击提交按钮，将添加新的响应到系统中"}
          </Typography.Text>
        </Col>
      </Row>
    </div>
  );
};

export default IServeResponseForm;