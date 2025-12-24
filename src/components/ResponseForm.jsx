import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Row, Col, Space, Divider, message, Spin } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/modules/userStore';
import { submitResponse } from '../api/modules/response';

const { Title } = Typography;
const { TextArea } = Input;

const ResponseForm = ({ demandId, demandTitle, onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // 获取用户信息
  const { userInfo } = useUserStore();

  // 提交响应
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      setLoading(true);
      
      const responseData = {
        demandId: demandId || parseInt(id),
        title: values.title,
        description: values.description,
        userId: userInfo?.id || 'unknown'
      };
      
      console.log('提交响应数据:', responseData);
      
      try {
        await submitResponse(responseData);
        message.success('响应提交成功');
        
        // 重置表单
        form.resetFields();
        
        // 调用成功回调
        if (onSuccess) {
          onSuccess();
        }
        
      } catch (error) {
        console.error('提交响应失败:', error);
        message.error('提交响应失败，请重试');
      } finally {
        setLoading(false);
      }
      
    } catch (errorInfo) {
      console.log('表单验证失败:', errorInfo);
      message.error('表单验证失败，请检查填写内容');
    }
  };

  // 表单验证规则
  const formRules = {
    title: [
      { required: true, message: '请输入响应标题', trigger: 'blur' },
      { max: 50, message: '响应标题不能超过50个字符', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入响应描述', trigger: 'blur' },
      { max: 500, message: '响应描述不能超过500个字符', trigger: 'blur' }
    ]
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5' }}>
      {/* 标题 */}
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            响应需求
          </Title>
        </Col>
      </Row>

      {/* 需求信息卡片 */}
      {demandTitle && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <Typography.Text strong>响应的需求：</Typography.Text>
            <Typography.Text type="secondary">{demandTitle}</Typography.Text>
          </div>
        </Card>
      )}

      {/* 响应表单卡片 */}
      <Card bordered={true}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: '',
            description: ''
          }}
        >
          <Row gutter={[16, 16]}>
            {/* 响应标题 */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
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

            {/* 响应描述 */}
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item
                name="description"
                label="响应描述"
                rules={formRules.description}
              >
                <TextArea 
                  placeholder="请详细描述您的响应内容，包括您能提供的服务、时间安排、联系方式等" 
                  rows={6} 
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
              <Button 
                type="default" 
                size="large"
                onClick={() => navigate(-1)}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                size="large"
                icon={<SendOutlined />}
                loading={loading}
                onClick={handleSubmit}
              >
                提交响应
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>

      {/* 表单说明 */}
      <Row justify="center" style={{ marginTop: 24 }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            请详细填写您的响应信息，这将帮助需求发布者了解您能提供的服务
          </Typography.Text>
        </Col>
      </Row>
    </div>
  );
};

export default ResponseForm;