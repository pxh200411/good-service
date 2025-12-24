import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Row, Col, Tag, Descriptions, Space, Divider, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { useDemandStore } from '../../store/modules/demandStore';
import { useUserStore } from '../../store/modules/userStore';
import ResponseForm from '../../components/ResponseForm';

const { Title, Text } = Typography;

const DemandDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showResponseForm, setShowResponseForm] = useState(false);
  
  // 从store获取状态和方法
  const {
    currentDemand,
    loading,
    getDemandById
  } = useDemandStore();

  // 从userStore获取用户状态
  const { userInfo } = useUserStore();

  // 加载需求详情
  useEffect(() => {
    const loadDemandDetail = async () => {
      if (id) {
        await getDemandById(id);
      }
    };
    loadDemandDetail();
  }, [id, getDemandById]);

  // 返回需求列表
  const handleBack = () => {
    navigate('/demand');
  };

  // 编辑需求
  const handleEdit = () => {
    navigate(`/demand/edit/${id}`);
  };

  // 响应需求
  const handleResponse = () => {
    setShowResponseForm(true);
  };

  // 处理响应成功
  const handleResponseSuccess = () => {
    setShowResponseForm(false);
    navigate('/demand');
  };


  // 如果没有需求数据，显示加载状态
  if (loading || !currentDemand) {
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

  // 如果显示响应表单
  if (showResponseForm) {
    return (
      <ResponseForm 
        demandId={parseInt(id)} 
        demandTitle={currentDemand.title}
        onSuccess={handleResponseSuccess}
      />
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f0f2f5' }}>
      {/* 返回和编辑按钮 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
          >
            返回列表
          </Button>
        </Col>
        <Col>
          {currentDemand.status === '待处理' && currentDemand.userId === userInfo?.id && (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
            >
              编辑需求
            </Button>
          )}
          { currentDemand.userId !== userInfo?.id && (
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleResponse}
            >
              去响应
            </Button>
          )}
        </Col>
      </Row>

      {/* 需求详情卡片 */}
      <Card title="需求详情" bordered={true} style={{ marginBottom: 24 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="需求ID">{currentDemand.id}</Descriptions.Item>
          <Descriptions.Item label="服务类型">{currentDemand.type}</Descriptions.Item>
          <Descriptions.Item label="需求标题">{currentDemand.title}</Descriptions.Item>
          <Descriptions.Item label="需求描述">{currentDemand.description}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="default" style={{ backgroundColor: '#f0f0f0' }}>
              {currentDemand.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="地址">{currentDemand.address}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(currentDemand.createTime).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(currentDemand.updateTime).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 操作历史记录 */}
      <Card title="操作记录" bordered={true}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ 
              padding: '16px', 
              background: '#fafafa', 
              borderRadius: '4px',
              borderLeft: '4px solid #1890ff'
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>创建需求</Text>
                  <Text type="secondary">{new Date(currentDemand.createTime).toLocaleString()}</Text>
                </div>
                <div>
                  <Text>服务类型：{currentDemand.type}</Text>
                </div>
                <div>
                  <Text>需求标题：{currentDemand.title}</Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        {/* 如果需求状态不是待处理，显示状态变更记录 */}
        {currentDemand.status !== '待处理' && (
          <>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ 
                  padding: '16px', 
                  background: '#fafafa', 
                  borderRadius: '4px',
                  borderLeft: '4px solid #faad14'
                }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>更新状态</Text>
                      <Text type="secondary">{new Date(currentDemand.updateTime).toLocaleString()}</Text>
                    </div>
                    <div>
                      <Text>状态变更为：</Text>
                      <Tag color="default" style={{ backgroundColor: '#f0f0f0' }}>
                        {currentDemand.status}
                      </Tag>
                    </div>
                  </Space>
                </div>
              </Col>
            </Row>
          </>
        )}

        {/* 如果需求状态是已完成，显示完成记录 */}
        {currentDemand.status === '已完成' && (
          <>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ 
                  padding: '16px', 
                  background: '#fafafa', 
                  borderRadius: '4px',
                  borderLeft: '4px solid #52c41a'
                }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>需求完成</Text>
                      <Text type="secondary">{new Date(currentDemand.updateTime).toLocaleString()}</Text>
                    </div>
                    <div>
                      <Text>需求已成功完成处理</Text>
                    </div>
                  </Space>
                </div>
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );
};

export default DemandDetail;