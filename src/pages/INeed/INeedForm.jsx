import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Card, Typography, Row, Col, Space, Divider, Spin, message, DatePicker } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useDemandStore } from '../../store/modules/demandStore';
import CascadeAddressSelector from '../../components/CascadeAddressSelector';
import FileUploader from '../../components/FileUploader';
import DemandFileViewer from '../../components/DemandFileViewer';
import moment from 'moment';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const INeedForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 文件上传相关状态
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [shouldDeleteExistingFile, setShouldDeleteExistingFile] = useState(false);
  
  // 判断是创建还是编辑模式
  const isEditMode = !!id;
  
  // 从store获取状态和方法
  const {
    serviceTypes,
    currentDemand,
    loading,
    getDemandById,
    createDemand,
    updateDemand
  } = useDemandStore();

  // 加载需求数据（编辑模式）
  useEffect(() => {
    if (isEditMode && id) {
      getDemandById(id);
    }
  }, [isEditMode, id, getDemandById]);

  // 当currentDemand变化时，填充表单数据（编辑模式）
  useEffect(() => {
    if (isEditMode && currentDemand) {
      // 检查状态是否为PUBLISHED，如果不是，不允许编辑
      if (currentDemand.status && currentDemand.status !== "PUBLISHED") {
        navigate('/i-need');
        return;
      }
      
      // 解析地址信息，如果currentDemand中有地址信息，需要解析为省市区
      let addressValue = {};
      if (currentDemand.address) {
        // 这里假设地址格式为"省市区"，需要根据实际情况调整解析逻辑
        // 暂时使用完整地址作为默认值
        addressValue = {
          fullAddress: currentDemand.address
        };
      }
      
      form.setFieldsValue({
        type: currentDemand.type,
        title: currentDemand.title,
        description: currentDemand.description,
        address: addressValue
      });
    }
  }, [isEditMode, currentDemand, form, navigate]);

  // 返回需求列表
  const handleBack = () => {
    navigate('/i-need');
  };

  // 处理文件选择（取消删除标记）
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setShouldDeleteExistingFile(false); // 选择新文件时取消删除标记
    message.success('文件已选择，将在提交时上传');
    return Promise.resolve({ success: true, file });
  };

  // 处理文件删除
  const handleDeleteFile = () => {
    setSelectedFile(null);
    setShouldDeleteExistingFile(true);
    message.info('已标记删除现有文件，提交后将移除');
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理地址数据
      const addressData = values.address || {};
      const fullAddress = addressData.fullAddress || '';
      
      // 处理时间数据
      const endTime = values.endTime ? values.endTime.endOf('day').toISOString() : new Date(Date.now() + 86400000).toISOString();
      
      const submitData = {
        ...values,
        address: fullAddress, // 使用完整地址字符串
        endTime: endTime, // 转换为ISO字符串格式
        // 映射前端字段到API字段
        locationId: addressData.itemId || 1, // 使用选择的区县ID作为locationId
      };
      
      // 移除address对象，只保留字符串地址
      delete submitData.address;
      submitData.address = fullAddress;
      
      if (isEditMode && id) {
        // 编辑需求
        try {
          //console.log('开始更新需求，ID:', id, '数据:', submitData);
          await updateDemand(id, submitData);
          //console.log('需求更新成功');
          
          // 处理文件上传/替换
          if (selectedFile) {
            //console.log('[DEBUG] INeedForm: starting file upload for demand:', id);
            setFileUploading(true);
            
            try {
              // 尝试替换文件，如果不存在则自动上传新文件
              //console.log('[DEBUG] INeedForm: importing replaceDemandFile API');
              const { replaceDemandFile } = await import('../../api/modules/demandFile');
              
              //console.log('[DEBUG] INeedForm: calling replaceDemandFile with progress callback');
              const fileResult = await replaceDemandFile(id, selectedFile, {
                onProgress: (progress) => {
                  //console.log('[DEBUG] INeedForm: file upload progress:', progress + '%');
                }
              });
              
              //console.log('[DEBUG] INeedForm: file upload completed successfully:', fileResult);
              message.success('需求更新成功，文件已更新');
            } catch (fileError) {
              //console.error('[DEBUG] INeedForm: file operation failed:', fileError);
              message.warning('需求更新成功，但文件操作失败，请稍后重试');
            } finally {
              setFileUploading(false);
            }
          } else if (shouldDeleteExistingFile) {
            // 用户选择删除文件但不上传新文件
            message.success('需求更新成功，文件已移除');
          } else {
            //console.log('[DEBUG] INeedForm: no file operation, demand updated successfully');
            message.success('需求更新成功');
          }
          
          navigate('/i-need');
        } catch (error) {
          //console.error('更新需求失败:', error);
          message.error('更新需求失败，请重试');
        }
      } else {
        // 创建新需求
        try {
          const demandResult = await createDemand(submitData);
          //console.log('需求创建成功:', demandResult);
          
          // 处理文件上传
          if (selectedFile) {
            //console.log('[DEBUG] INeedForm: starting file upload for new demand:', demandResult.id);
            setFileUploading(true);
            
            try {
              // 使用 uploadDemandFile API 上传新文件
              //console.log('[DEBUG] INeedForm: importing uploadDemandFile API');
              const { uploadDemandFile } = await import('../../api/modules/demandFile');
              
              //console.log('[DEBUG] INeedForm: calling uploadDemandFile with progress callback');
              const fileUploadResult = await uploadDemandFile(demandResult.id, selectedFile, {
                onProgress: (progress) => {
                  //console.log('[DEBUG] INeedForm: file upload progress:', progress + '%');
                }
              });
              
              //console.log('[DEBUG] INeedForm: file upload completed successfully:', fileUploadResult);
              message.success('需求创建成功，文件已上传');
            } catch (fileError) {
              //console.error('[DEBUG] INeedForm: file upload failed:', fileError);
              message.warning('需求创建成功，但文件上传失败，请稍后重试');
            } finally {
              setFileUploading(false);
            }
          } else {
            //console.log('[DEBUG] INeedForm: no file to upload, demand created successfully');
            message.success('需求创建成功');
          }
          
          navigate('/i-need');
        } catch (error) {
          //console.error('创建需求失败:', error);
          message.error('创建需求失败，请重试');
        }
      }
    } catch (errorInfo) {
      //console.log('表单验证失败:', errorInfo);
      message.error('表单验证失败，请检查填写内容');
    }
  };

  // 表单验证规则
  const formRules = {
    type: [
      { required: true, message: '请选择服务类型', trigger: 'change' }
    ],
    title: [
      { required: true, message: '请输入需求标题', trigger: 'blur' },
      { max: 50, message: '需求标题不能超过50个字符', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入需求描述', trigger: 'blur' },
      { max: 500, message: '需求描述不能超过500个字符', trigger: 'blur' }
    ],
    address: [
      { 
        required: true, 
        validator: (_, value) => {
          if (!value || !value.fullAddress) {
            return Promise.reject('请选择完整的地址信息');
          }
          if (value.fullAddress.length > 100) {
            return Promise.reject('地址不能超过100个字符');
          }
          return Promise.resolve();
        },
        trigger: 'change'
      }
    ]
  };

  // 如果是编辑模式且正在加载，显示加载状态
  if (isEditMode && loading && !currentDemand) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: '#f0f2f5',
        padding: '20px'
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f0f2f5' }}>
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
            {isEditMode ? '编辑需求' : '创建需求'}
          </Title>
        </Col>
        <Col style={{ width: 100 }}></Col> {/* 占位，保持标题居中 */}
      </Row>

      {/* 表单卡片 */}
      <Card bordered={true}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: '',
            title: '',
            description: '',
            address: {},
            status: '待处理',
            endTime: moment().add(1, 'day') // 默认结束时间为明天
          }}
        >
          <Row gutter={[16, 16]}>
            {/* 服务类型 */}
            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
              <Form.Item
                name="type"
                label="服务类型"
                rules={formRules.type}
              >
                <Select placeholder="请选择服务类型">
                  {serviceTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 需求标题 */}
            <Col xs={24} sm={24} md={12} lg={12} xl={16}>
              <Form.Item
                name="title"
                label="需求标题"
                rules={formRules.title}
              >
                <Input placeholder="请输入需求标题" maxLength={50} />
              </Form.Item>
            </Col>

            {/* 需求描述 */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item
                name="description"
                label="需求描述"
                rules={formRules.description}
              >
                <TextArea 
                  placeholder="请输入需求描述" 
                  rows={4} 
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>

            {/* 地址 */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item
                name="address"
                label="地址"
                rules={formRules.address}
              >
                <CascadeAddressSelector />
              </Form.Item>
            </Col>

            {/* 结束时间 */}
            <Col xs={24} sm={24} md={12} lg={12} xl={8}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || !moment.isMoment(value) || !value.isValid()) {
                        return Promise.reject(new Error('请选择结束时间'));
                      }
                      return Promise.resolve();
                    },
                    trigger: 'change'
                  }
                ]}
              >
                <DatePicker
                  placeholder="请选择结束时间"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    // 禁止选择过去的时间
                    return current && current < moment().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 需求文件预览 */}
          {isEditMode && currentDemand && (
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <DemandFileViewer 
                  demandId={currentDemand.id} 
                  title="当前附件"
                  onDelete={handleDeleteFile}
                />
              </Col>
            </Row>
          )}

          {/* 文件上传组件 */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item label="附件上传">
                <FileUploader
                  onUpload={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.svg,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv"
                  maxSize={20 * 1024 * 1024} // 20MB
                  multiple={false}
                  showFileList={true}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  支持上传PDF、Word、Excel、PPT、图片等文件，最大20MB
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* 提交按钮 */}
          <Row justify="center">
            <Space size="large">
              <Button 
                type="default" 
                size="large"
                onClick={handleBack}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                size="large"
                icon={<SaveOutlined />}
                loading={loading || fileUploading}
                onClick={handleSubmit}
              >
                {isEditMode ? '保存修改' : '创建需求'}
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>

      {/* 表单说明 */}
      <Row justify="center" style={{ marginTop: 24 }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            {isEditMode 
              ? '修改需求信息后点击保存按钮，将更新到系统中' 
              : '填写需求信息后点击创建按钮，将添加新的需求到系统中'}
          </Typography.Text>
        </Col>
      </Row>
    </div>
  );
};

export default INeedForm;