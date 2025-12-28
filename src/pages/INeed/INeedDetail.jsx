import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Row, Col, Tag, Descriptions, Space, Divider, Spin, List, Avatar, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useDemandStore } from '../../store/modules/demandStore';
import { useUserStore } from '../../store/modules/userStore';
import { getReceivedResponsesByDemandId, getResponseById } from '../../api/modules/response';
import { getLocationById } from '../../api/modules/location';
import ResponseDetailModal from '../../components/ResponseDetailModal';
import DemandFileViewer from '../../components/DemandFileViewer';
import antdTheme from '../../config/theme';

const { Title, Text } = Typography;

const INeedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 从store获取状态和方法
  const {
    currentDemand,
    loading,
    getDemandById
  } = useDemandStore();

  // 从userStore获取用户状态
  const { userInfo } = useUserStore();

  // 响应相关状态
  const [receivedResponses, setReceivedResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  // 响应详情弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  
  // 位置信息状态
  const [locationName, setLocationName] = useState('');

  // 加载需求详情
  useEffect(() => {
    const loadDemandDetail = async () => {
      if (id) {
        await getDemandById(id);
      }
    };
    loadDemandDetail();
  }, [id, getDemandById]);

  // 加载收到的响应
  useEffect(() => {
    const loadReceivedResponses = async () => {
      if (id) {
        setResponsesLoading(true);
        try {
          const response = await getReceivedResponsesByDemandId(id);
          // 直接使用API返回的响应列表
          const currentDemandResponses = response.data || response;
          setReceivedResponses(Array.isArray(currentDemandResponses) ? currentDemandResponses : []);
        } catch (error) {
          //console.error('加载响应失败:', error);
          message.error('加载响应失败，请稍后重试');
          setReceivedResponses([]);
        } finally {
          setResponsesLoading(false);
        }
      }
    };
    loadReceivedResponses();
  }, [id]);
  
  // 加载位置信息
  useEffect(() => {
    const loadLocationName = async () => {
      if (currentDemand && currentDemand.locationId) {
        try {
          const response = await getLocationById(currentDemand.locationId);
          const name = response.data?.name || response.name || '';
          setLocationName(name);
        } catch (error) {
          //console.error('获取位置信息失败:', error);
          setLocationName('');
        }
      } else if (currentDemand && currentDemand.address) {
        // 如果没有locationId但有address，则使用address
        setLocationName(currentDemand.address);
      }
    };
    
    loadLocationName();
  }, [currentDemand]);

  // 返回需求列表
  const handleBack = () => {
    navigate('/i-need');
  };

  // 编辑需求
  const handleEdit = () => {
    navigate(`/i-need/edit/${id}`);
  };

  // 处理查看响应详情
  const handleViewResponseDetail = async (response) => {
    try {
      setResponsesLoading(true);
      const apiResponse = await getResponseById(response.id);
      const detailedResponse = apiResponse.data || apiResponse;
      setSelectedResponse(detailedResponse);
      setDetailModalVisible(true);
    } catch (error) {
      //console.error('获取响应详情失败:', error);
      message.error('获取响应详情失败，请稍后重试');
    } finally {
      setResponsesLoading(false);
    }
  };

  // 状态标签颜色映射
  const statusColorMap = {
    'PUBLISHED': 'blue',
    'RESPONDED': 'orange',
    'RESOLVED': 'green',
    'CANCELLED': 'gray'
  };

  // 响应状态颜色映射
  const responseStatusColorMap = {
    'PENDING': 'blue',
    'ACCEPTED': 'green',
    'REJECTED': 'red',
    'IMPLICITLY_REJECTED': 'orange',
    'CANCELLED': 'gray',
    'RESOLVED': 'purple'
  };

  // 格式化时间显示
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '暂无时间';
    try {
      return new Date(dateTimeStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTimeStr;
    }
  };

  // 如果没有需求数据，显示加载状态
  if (loading || !currentDemand) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          background: antdTheme.token.colorBgContainer,
          padding: '20px'
        }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: antdTheme.token.colorBgContainer }}>
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
   {true&&(
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
            >
              编辑需求
            </Button>
          )}
        </Col>
      </Row>

      {/* 需求详情卡片 */}
      <Card title="需求详情" bordered={true} style={{ marginBottom: 24 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="服务类型">{currentDemand.type}</Descriptions.Item>
          <Descriptions.Item label="需求标题">{currentDemand.title}</Descriptions.Item>
          <Descriptions.Item label="需求描述">{currentDemand.description}</Descriptions.Item>
          <Descriptions.Item label="地址">{locationName || '暂无地址'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusColorMap[currentDemand.status]}>
              {currentDemand.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {currentDemand.createTime ? new Date(currentDemand.createTime).toLocaleString() : '暂无数据'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {currentDemand.updateTime ? new Date(currentDemand.updateTime).toLocaleString() : '暂无数据'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 需求文件预览 */}
      <DemandFileViewer 
        demandId={currentDemand.id} 
        title="需求附件"
      />

      {/* 收到的响应列表 */}
      <Card 
        title={`收到的响应 (${receivedResponses.length})`} 
        bordered={true}
        style={{ marginBottom: 24 }}
      >
        <Spin spinning={responsesLoading} tip="加载响应中...">
          {receivedResponses.length > 0 ? (
            <List
              itemLayout="vertical"
              dataSource={receivedResponses}
              renderItem={(response) => (
                <List.Item
                  key={response.id}
                  style={{ padding: '16px 0' }}
                >
                  <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                    <Col flex="1">
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <Text strong>{response.title}</Text>
                            <Text type="secondary">响应ID: {response.id}</Text>
                          </Space>
                        }
                        description={response.description}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Space direction="vertical" size="small">
                          <div>
                            <Text type="secondary">需求ID: </Text>
                            <Text>{response.demandId}</Text>
                          </div>
                          <div>
                            <Text type="secondary">响应者ID: </Text>
                            <Text>{response.userId}</Text>
                          </div>
                          <div>
                            <Text type="secondary">创建时间: </Text>
                            <Text>{formatDateTime(response.createdAt)}</Text>
                          </div>
                          {response.modifiedAt && response.modifiedAt !== response.createdAt && (
                            <div>
                              <Text type="secondary">修改时间: </Text>
                              <Text>{formatDateTime(response.modifiedAt)}</Text>
                            </div>
                          )}
                        </Space>
                      </div>
                    </Col>
                    <Col>
                      <Space direction="vertical" align="end">
                        <Tag color={responseStatusColorMap[response.status] || 'default'}>
                          {response.status || 'UNKNOWN'}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatDateTime(response.createdAt)}
                        </Text>
                        <Button
                          type="default"
                          icon={<EyeOutlined />}
                          size="small"
                          style={{
                            height: 32,
                            backgroundColor: 'lightGray',
                            color: 'black',
                            fontSize: 14,
                            borderRadius: 8,
                            lineHeight: "32px",
                          }}
                          onClick={() => handleViewResponseDetail(response)}
                        >
                          详情
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">暂无收到的响应</Text>
            </div>
          )}
        </Spin>
      </Card>

      {/* 操作历史记录 */}
      <Card title="操作记录" bordered={true}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ 
              padding: '16px', 
              background: antdTheme.token.colorBgContainer,
              borderRadius: '4px',
              borderLeft: '4px solid #1890ff'
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>创建需求</Text>
                  <Text type="secondary">{currentDemand.createTime ? new Date(currentDemand.createTime).toLocaleString() : '暂无数据'}</Text>
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

                        {/* 如果需求状态不是PUBLISHED，显示状态变更记录 */}
                        {currentDemand.status !== 'PUBLISHED' && (
          <>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                 <div style={{ 
                   padding: '16px', 
                   background: antdTheme.token.colorBgContainer,
                   borderRadius: '4px',
                   borderLeft: '4px solid #faad14'
                 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>更新状态</Text>
                      <Text type="secondary">{currentDemand.updateTime ? new Date(currentDemand.updateTime).toLocaleString() : '暂无数据'}</Text>
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
                   background: antdTheme.token.colorBgContainer,
                   borderRadius: '4px',
                   borderLeft: '4px solid #52c41a'
                 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>需求完成</Text>
                      <Text type="secondary">{currentDemand.updateTime ? new Date(currentDemand.updateTime).toLocaleString() : '暂无数据'}</Text>
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

      {/* 响应详情弹窗 */}
      <ResponseDetailModal
        visible={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedResponse(null);
        }}
        response={selectedResponse}
        currentUser={userInfo}
        loading={responsesLoading}
      />
    </div>
  );
};

export default INeedDetail;