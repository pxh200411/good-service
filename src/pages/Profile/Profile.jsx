import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Row,
  Col,
  Typography,
  Space,
  Spin,
  Alert,
  Divider,
  Tabs,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  SaveOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useUserStore } from "../../store/modules/userStore";
import { getUserByUsername, updateUserByPut, updateUserPassword } from "../../api/modules/user";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = () => {
  const { userInfo, updateUserInfo } = useUserStore();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editing, setEditing] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);

  // 加载用户详细信息
  useEffect(() => {
    if (userInfo?.username) {
      loadUserDetails();
    }
  }, [userInfo]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserByUsername(userInfo.username);
      const userData = response.data || response;
      setUserDetails(userData);
      
      // 填充表单
      form.setFieldsValue({
        username: userData.username || userInfo.username,
        realName: userData.realName || '',
        phone: userData.phone || '',
        biography: userData.biography || '',
      });
    } catch (error) {
      //console.error('加载用户详情失败:', error);
      setError('加载用户信息失败，请稍后重试');
      // 如果API调用失败，使用store中的用户信息
      form.setFieldsValue({
        username: userInfo.username,
        realName: userInfo.realName || '',
        phone: userInfo.phone || '',
        biography: userInfo.biography || '',
      });
    } finally {
      setLoading(false);
    }
  };

  // 保存个人信息
  const handleSaveProfile = async (values) => {
    try {
      setLoading(true);
      setError(null);

      // 只包含指定的字段，移除email
      const updateData = {
        realName: values.realName,
        phone: values.phone,
        biography: values.biography,
      };

      const response = await updateUserByPut(userInfo.username, updateData);
      const updatedUser = response.data || response;
      
      // 更新store中的用户信息
      await updateUserInfo(updateData);
      
      message.success('个人信息更新成功！');
      setUserDetails({ ...userDetails, ...updatedUser });
    } catch (error) {
      //console.error('更新个人信息失败:', error);
      setError(error.response?.data?.message || '更新个人信息失败，请稍后重试');
      message.error('更新个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (values) => {
    try {
      setPasswordLoading(true);
      setError(null);

      const passwordData = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };

      await updateUserPassword(userInfo.username, passwordData);
      
      message.success('密码修改成功！');
      passwordForm.resetFields();
    } catch (error) {
      //console.error('修改密码失败:', error);
      setError(error.response?.data?.message || '修改密码失败，请稍后重试');
      message.error('修改密码失败');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Title level={1} style={{ marginBottom: 24, textAlign: "center" }}>
        个人中心
      </Title>

      {/* 错误提示 */}
      {error && (
        <Alert
          message="操作失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      <Row gutter={[24, 24]}>
        {/* 左侧用户信息卡片 */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                src={userInfo?.avatar}
                style={{ marginBottom: 16 }}
              />
              <Title level={3}>{userInfo?.username || '用户'}</Title>
              <Text type="secondary">
                {userDetails?.realName || userInfo?.realName || '未设置真实姓名'}
              </Text>
            </div>
            
            <Divider />

          </Card>
        </Col>

        {/* 右侧编辑区域 */}
        <Col xs={24} md={16}>
          <Card>
            
            
            <Tabs
              defaultActiveKey="profile"
              items={[
                {
                  key: 'profile',
                  label: '个人信息',
                  children: (
                    <Spin spinning={loading}>
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSaveProfile}
                      >
                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="username"
                              label="用户名"
                            >
                              <Input disabled />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="realName"
                              label="真实姓名"
                              rules={[
                                { max: 50, message: '真实姓名不能超过50个字符' }
                              ]}
                            >
                              <Input 
                                placeholder="请输入真实姓名" 
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="phone"
                              label="手机号"
                              rules={[
                                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                              ]}
                            >
                              <Input 
                                placeholder="请输入手机号" 
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            {/* 邮箱字段已移除，根据后端API要求 */}
                          </Col>
                        </Row>

                        <Form.Item
                          name="biography"
                          label="个人简介"
                          rules={[
                            { max: 500, message: '个人简介不能超过500个字符' }
                          ]}
                        >
                          <TextArea
                            rows={4}
                            placeholder="请输入个人简介"
                            maxLength={500}
                            showCount
                          />
                        </Form.Item>

                        <Form.Item>
                          <Space>
                            <>
                            <Button
                              type="primary"
                              htmlType="submit"
                              icon={<SaveOutlined />}
                              loading={loading}
                              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            >
                              保存个人信息
                            </Button>
                            <Button
                              onClick={() => {
                                loadUserDetails(); // 重新加载数据
                              }}
                            >
                              重置
                            </Button>
                          </>
                          </Space>
                        </Form.Item>
                      </Form>
                    </Spin>
                  ),
                },
                {
                  key: 'password',
                  label: '修改密码',
                  children: (
                    <Spin spinning={passwordLoading}>
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                        style={{ maxWidth: 400 }}
                      >
                        <Form.Item
                          name="oldPassword"
                          label="当前密码"
                          rules={[
                            { required: true, message: '请输入当前密码' }
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请输入当前密码"
                          />
                        </Form.Item>

                        <Form.Item
                          name="newPassword"
                          label="新密码"
                          rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 6, message: '密码长度不能少于6位' },
                            { max: 20, message: '密码长度不能超过20位' }
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请输入新密码"
                          />
                        </Form.Item>

                        <Form.Item
                          name="confirmPassword"
                          label="确认新密码"
                          dependencies={['newPassword']}
                          rules={[
                            { required: true, message: '请确认新密码' },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请再次输入新密码"
                          />
                        </Form.Item>

                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={passwordLoading}
                            style={{ width: '100%' }}
                          >
                            修改密码
                          </Button>
                        </Form.Item>
                      </Form>
                    </Spin>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;