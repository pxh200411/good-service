import React, { useState } from 'react';
import {
  Modal,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Divider,
  Spin
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useDemandStore } from '../store/modules/demandStore';
import { getLatestDemandFile } from '../api/modules/demandFile';
import { formatTime } from '../utils/timeUtils';

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
  
  // 下载相关状态
  const [downloading, setDownloading] = useState(false);
  // 文件信息状态
  const [fileInfo, setFileInfo] = useState(null);
  const [fileInfoLoading, setFileInfoLoading] = useState(false);

  // 获取文件信息（元数据）
  const fetchFileInfo = async (demandId) => {
    if (!demandId) return;
    try {
      setFileInfoLoading(true);
      //console.log('[DEBUG] ResponseDetailModal: fetching file info for demandId:', demandId);
      const response = await getLatestDemandFile(demandId, false); // 获取元数据
      //console.log('[DEBUG] ResponseDetailModal: file info received:', response.data);
      setFileInfo(response.data);
    } catch (error) {
      //console.error('[DEBUG] ResponseDetailModal: failed to fetch file info:', error);
      setFileInfo(null); // 清除旧信息
      // 可以选择性地显示错误消息，或者静默失败
      // message.error('获取文件信息失败: ' + (error.message || '未知错误'));
    } finally {
      setFileInfoLoading(false);
    }
  };

  // 当弹窗打开且有权限时，获取文件信息
  React.useEffect(() => {
    if (visible && response && canDownloadResource()) {
      fetchFileInfo(response.demandId);
    } else {
      // 如果弹窗关闭或没有权限，清除文件信息
      setFileInfo(null);
    }
  }, [visible, response, currentUser]); // 依赖项

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
      //console.error('接受响应失败:', error);
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
      //console.error('拒绝响应失败:', error);
      message.error('拒绝失败，请稍后重试');
    }
  };

  // 处理下载响应资源
  const handleDownloadResource = async () => {
    if (!response || !response.demandId) {
      message.error('无法下载：缺少需求ID');
      return;
    }

    try {
      setDownloading(true);
      //console.log('[DEBUG] ResponseDetailModal: starting download for demandId:', response.demandId);
      
      const response_data = await getLatestDemandFile(response.demandId, true);
      //console.log('[DEBUG] ResponseDetailModal: download response received:', response_data);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response_data.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileInfo?.filename || `response_${response.id}_resource`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('文件下载已开始');
      //console.log('[DEBUG] ResponseDetailModal: download completed successfully');
    } catch (error) {
      //console.error('[DEBUG] ResponseDetailModal: download failed:', error);
      message.error('文件下载失败: ' + (error.message || '未知错误'));
    } finally {
      setDownloading(false);
      //console.log('[DEBUG] ResponseDetailModal: download finished');
    }
  };

  // 检查当前用户是否有权限操作
  const canOperate = () => {
    // 只有需求发布者可以接受/拒绝响应
    return true
  };

  // 检查当前用户是否有权限下载资源
  const canDownloadResource = () => {
    // 只有需求发布者可以下载响应资源，且响应已被接受
    return true
    return response && currentUser && 
           response.demandOwnerId === currentUser.id &&
           (response.status === 'ACCEPTED' || response.status === 'RESOLVED');
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
            {formatTime(response.createdAt)}
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

        {/* 响应资源文件信息 */}
        {canDownloadResource() && (
          <>
            <Title level={4}>响应资源文件</Title>
            <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="文件名">
                {fileInfoLoading ? (
                  <Spin size="small" />
                ) : fileInfo?.filename ? (
                  <Text strong>{fileInfo.filename}</Text>
                ) : (
                  <Text type="secondary">暂无文件</Text>
                )}
              </Descriptions.Item>
              {fileInfo && (
                <>
                  <Descriptions.Item label="文件大小">
                    {fileInfo.sizeBytes ? `${(fileInfo.sizeBytes / 1024).toFixed(2)} KB` : '未知'}
                  </Descriptions.Item>
                  <Descriptions.Item label="文件类型">
                    {fileInfo.mimeType || '未知'}
                  </Descriptions.Item>
                </>
              )}
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

        {/* 下载资源按钮 */}
        {canDownloadResource() && (
          <>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Space size="large">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadResource}
                  loading={downloading}
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff'
                  }}
                >
                  {downloading ? '下载中...' : '下载响应资源'}
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