import React, { useEffect } from "react";
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
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useDemandStore } from "../../store/modules/demandStore";
import { useUserStore } from "../../store/modules/userStore";

const { Title } = Typography;
const { TextArea } = Input;

const IServeResponseForm = () => {
  const { demandId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

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
        if (response.status !== "PENDING") {
          message.warning("只有PENDING状态的响应可以修改");
          //navigate("/i-serve");
          //return;
        }

        form.setFieldsValue({
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

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const responseData = {
        demandId,
        userId: userInfo.id,
        content: values.content,
      };

      if (isEdit && response) {
        // 修改响应
        await updateServiceResponse(response.id, responseData);
        message.success("响应更新成功");
        navigate("/i-serve");
      } else {
        // 创建新响应
        await createServiceResponse(responseData);
        message.success("响应提交成功");
        navigate("/i-serve");
      }
    } catch (errorInfo) {
      if (errorInfo.errorFields) {
        console.log("表单验证失败:", errorInfo);
        message.error("表单验证失败，请检查填写内容");
      } else {
        console.log("响应操作失败:", errorInfo);
        message.error("操作失败，请稍后重试");
      }
    }
  };

  // 表单验证规则
  const formRules = {
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
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <strong>地址:</strong> {currentDemand.address}
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
            content: "",
          }}
        >
          <Row gutter={[16, 16]}>
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
                loading={loading}
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