import React from 'react';
import {
  Modal,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Divider
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useDemandStore } from '../store/modules/demandStore';

const { Title, Text } = Typography;

const ResponseDetailModal = ({
  visible,
  onCancel,
  response,
  currentUser,
  onAccept,
  onReject,
  loading = false
}) => {
  // 从demandStore获取接受/拒绝方法
  const { acceptResponse, rejectResponse } = useDemandStore();

  // 状态颜色映射
  const statusColorMap = {
    'PENDING': 'blue',
    'ACCEPTED': 'green',
    'REJECTED': 'red',
    'IMPLICITLY_REJECTED': 'orange',
    'CANCELLED': 'gray',
    'RESOLVED': 'purple'
  };

  // 处理接受响应
  const handleAccept = async () => {
    try {
      await acceptResponse(response.id);
      message.success('响应已接受');
      if (onAccept) onAccept();
      onCancel();
    } catch (error) {
      console.error('接受响应失败:', error);
      message.error('接受失败，请稍后重试');
    }
  };

  // 处理拒绝响应
  const handleReject = async () => {
    try {
      await rejectResponse(response.id);
      message.success('响应已拒绝');
      if (onReject) onReject();
      onCancel();
    } catch (error) {
      console.error('拒绝响应失败:', error);
      message.error('拒绝失败，请稍后重试');
    }
  };

  // 检查当前用户是否有权限操作
  const canOperate = () => {
    // 只有需求发布者可以接受/拒绝响应
    return response && currentUser && 
           response.demandOwnerId === currentUser.id &&
           response.status === 'PENDING';
  };

  // 格式化时间
  const formatTime = (timeString) => {
    if (!timeString) return '未知';
    return new Date(timeString).toLocaleString();
  };

  if (!response) {
    return null;
  }

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          响应详情
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={null}
      destroyOnClose
      confirmLoading={loading}
    >
      <div style={{ padding: '20px 0' }}>
        {/* 基本信息 */}
        <Title level={4}>基本信息</Title>
        <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="响应ID" span={1}>
            {response.id}
          </Descriptions.Item>
          <Descriptions.Item label="状态" span={1}>
            <Tag color={statusColorMap[response.status]||'gold'}>
              {response.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="需求标题" span={2}>
            {response.title || '未知需求'}
          </Descriptions.Item>
          <Descriptions.Item label="响应时间" span={1}>
            {formatTime(response.responseTime)}
          </Descriptions.Item>
        </Descriptions>

        {/* 响应内容 */}
        <Title level={4}>响应内容</Title>
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: '#f5f5f5', 
          borderRadius: 8,
          minHeight: 100 
        }}>
          <Text>
            {response.description || '暂无响应内容'}
          </Text>
        </div>

        {/* 需求状态信息 */}
        {response.demandStatus && (
          <>
            <Title level={4}>关联需求状态</Title>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="需求状态">
                <Tag color="blue">
                  {response.demandStatus}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}

        {/* 操作按钮 */}
        {canOperate() && (
          <>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Space size="large">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleAccept}
                  style={{
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a'
                  }}
                >
                  接受响应
                </Button>
                <Button
                  type="primary"
                  danger
                  icon={<CloseOutlined />}
                  onClick={handleReject}
                >
                  拒绝响应
                </Button>
              </Space>
            </div>
          </>
        )}

        {/* 状态说明 */}
        {!canOperate() && response.status !== 'PENDING' && (
          <div style={{ 
            marginTop: 16, 
            padding: 12, 
            background: '#fffbe6', 
            border: '1px solid #ffe58f',
            borderRadius: 6 
          }}>
            <Text type="warning">
              此响应当前状态为 <Tag color={statusColorMap[response.status]||'gold'}>{response.status}</Tag>，
              无法进行接受或拒绝操作。
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ResponseDetailModal;