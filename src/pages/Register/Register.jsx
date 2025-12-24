import React from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../store/modules/userStore";

// 使用import引入背景图
import backgroundImage from "../../assets/bg_base.png";

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { register, loading, error, clearError } = useUserStore();

  const onFinish = async (values) => {
    clearError();
    const success = await register(values);

    if (success) {
      message.success("注册成功");
      navigate("/login");
    } else {
      message.error(error || "注册失败");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-body)",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card
        style={{
          width: 400,
          padding: "24px",
          backgroundColor: "var(--bg-container)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={2} style={{ color: "var(--primary-color)" }}>
            注册
          </Title>
          <Text type="secondary" style={{ color: "var(--text-secondary)" }}>
            创建您的新账户
          </Text>
        </div>

        <Form form={form} name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
            label={<Text style={{ color: "var(--text-main)" }}>用户名</Text>}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-main)",
              }}
              placeholderStyle={{ color: "var(--text-disabled)" }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "请输入邮箱地址" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
            label={<Text style={{ color: "var(--text-main)" }}>邮箱</Text>}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱地址"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-main)",
              }}
              placeholderStyle={{ color: "var(--text-disabled)" }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "请输入手机号码" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号码" },
            ]}
            label={<Text style={{ color: "var(--text-main)" }}>手机号码</Text>}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="请输入手机号码"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-main)",
              }}
              placeholderStyle={{ color: "var(--text-disabled)" }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码长度不能少于6位" },
            ]}
            label={<Text style={{ color: "var(--text-main)" }}>密码</Text>}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-main)",
              }}
              placeholderStyle={{ color: "var(--text-disabled)" }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
            label={<Text style={{ color: "var(--text-main)" }}>确认密码</Text>}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请确认密码"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-main)",
              }}
              placeholderStyle={{ color: "var(--text-disabled)" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: "100%",
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--primary-color)",
                height: "40px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "var(--primary-hover)";
                  e.target.style.borderColor = "var(--primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "var(--primary-color)";
                  e.target.style.borderColor = "var(--primary-color)";
                }
              }}
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "var(--text-secondary)" }}>已有账户？</Text>
            <Link
              style={{ color: "var(--link-color)", marginLeft: "8px" }}
              to="/login"
            >
              立即登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
