import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Card, Typography, Row, Col, Space, Divider, Spin, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useDemandStore } from '../../store/modules/demandStore';
import { useUserStore } from '../../store/modules/userStore';
import CascadeAddressSelector from '../../components/CascadeAddressSelector';
import ResponseForm from '../../components/ResponseForm';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DemandForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 判断是创建还是编辑模式
  const isEditMode = !!id;
  
  // 使用useMemo计算权限状态
  const { isOwner, shouldShowResponseForm } = useMemo(() => {
    if (isEditMode && currentDemand && userInfo?.id) {
      const owner = currentDemand.userId === userInfo.id;
      return {
        isOwner: owner,
        shouldShowResponseForm: !owner
      };
    }
    return {
      isOwner: false,
      shouldShowResponseForm: false
    };
  }, [isEditMode, currentDemand, userInfo?.id]);
  
  // 从store获取状态和方法
  const {
    serviceTypes,
    currentDemand,
    loading,
    getDemandById,
    createDemand,
    updateDemand
  } = useDemandStore();
  
  // 获取用户信息
  const { userInfo } = useUserStore();
  
  // 从服务类型名称获取serviceId
  const getServiceIdFromType = (typeName) => {
    // 默认的服务类型映射
    const defaultMapping = {
      "管道维修": 1,
      "助老服务": 2, 
      "保洁服务": 3,
      "就诊服务": 4,
      "营养餐服务": 5,
      "定期接送服务": 6
    };
    
    // 优先使用动态获取的映射
    if (window.serviceTypeMap) {
      for (const [id, name] of Object.entries(window.serviceTypeMap)) {
        if (name === typeName) {
          return parseInt(id);
        }
      }
    }
    
    // 回退到默认映射
    return defaultMapping[typeName] || 1;
  };

  // 加载需求数据（编辑模式）
  useEffect(() => {
    const loadDemandData = async () => {
      if (isEditMode && id) {
        await getDemandById(id);
      }
    };
    loadDemandData();
  }, [isEditMode, id, getDemandById]);

  // 当currentDemand变化时，填充表单数据（编辑模式）
  useEffect(() => {
    if (isEditMode && currentDemand && isOwner) {
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
        address: addressValue,
        status: currentDemand.status
      });
    }
  }, [isEditMode, currentDemand, form, isOwner]);

  // 返回需求列表
  const handleBack = () => {
    if (isEditMode) {
      navigate(`/demand/${id}`);
    } else {
      navigate('/demand');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    // 如果不是所有者且是编辑模式，不允许提交
    if (isEditMode && !isOwner) {
      message.error('您没有权限编辑此需求');
      return;
    }
    
    try {
      const values = await form.validateFields();
      
      // 处理地址数据
      const addressData = values.address || {};
      const fullAddress = addressData.fullAddress || '';
      
      const submitData = {
        ...values,
        address: fullAddress, // 使用完整地址字符串
        userId: userInfo?.id || 'unknown',
        // 映射前端字段到API字段
        locationId: addressData.itemId || 1, // 使用选择的区县ID作为locationId
        serviceId: getServiceIdFromType(values.type) || 1,
      };
      
      // 移除address对象，只保留字符串地址
      delete submitData.address;
      submitData.address = fullAddress;
      
      if (isEditMode && id) {
        // 编辑需求
        try {
          console.log('开始更新需求，ID:', id, '数据:', submitData);
          await updateDemand(id, submitData);
          console.log('需求更新成功');
          message.success('需求更新成功');
          // 延迟一下再跳转，确保网络请求完全完成
          setTimeout(() => {
            console.log('跳转到需求详情页:', `/demand/${id}`);
            navigate(`/demand/${id}`);
          }, 100);
        } catch (error) {
          console.error('更新需求失败:', error);
          message.error('更新需求失败，请重试');
        }
      } else {
        // 创建新需求
        await createDemand(submitData);
        message.success('需求创建成功');
        navigate('/demand');
      }
    } catch (errorInfo) {
      console.log('表单验证失败:', errorInfo);
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

  // 如果是编辑模式但不是所有者，显示响应表单
  if (isEditMode && currentDemand && shouldShowResponseForm) {
    return (
      <ResponseForm 
        demandId={parseInt(id)} 
        demandTitle={currentDemand.title}
        onSuccess={() => navigate(`/demand/${id}`)}
      />
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
            {isEditMode ? (isOwner ? '编辑需求' : '需求详情') : '创建需求'}
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
          status: 'PUBLISHED'
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

            {/* 状态（仅编辑模式显示） */}
            {isEditMode && (
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态', trigger: 'change' }]}
                >
                  <Select placeholder="请选择状态">
              <Option value="PUBLISHED">PUBLISHED</Option>
              <Option value="RESPONDED">RESPONDED</Option>
              <Option value="RESOLVED">RESOLVED</Option>
              <Option value="CANCELLED">CANCELLED</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
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
                loading={loading}
                onClick={handleSubmit}
              >
                {isEditMode ? (isOwner ? '保存修改' : '保存修改') : '创建需求'}
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
                ? (isOwner 
                  ? '修改需求信息后点击保存按钮，将更新到系统中' 
                  : '您不是此需求的所有者，无法编辑此需求')
                : '填写需求信息后点击创建按钮，将添加新的需求到系统中'}
            </Typography.Text>
          </Col>
        </Row>
    </div>
  );
};

export default DemandForm;