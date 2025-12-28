import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Modal, Descriptions, Tag, message, Image } from 'antd';
import { FileOutlined, DownloadOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { getLatestDemandFile } from '../api/modules/demandFile';

/**
 * 需求文件查看组件
 * 只用于查看和下载，不能上传或修改
 */
const DemandFileViewer = ({ demandId, title = "相关文件" }) => {
  const [loading, setLoading] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // 检查文件状态
  const checkFileStatus = async () => {
    if (!demandId) return;
    
    setLoading(true);
    try {
      const response = await getLatestDemandFile(demandId, false);
      //console.log('[DEBUG] DemandFileViewer checkFileStatus response:', response);
      
      // 处理二进制文件数据
      if (response) {
        const blob = response;
        const fileUrl = window.URL.createObjectURL(blob);
        
        // 检查文件类型
        const isImage = blob.type.startsWith('image/');
        const isVideo = blob.type.startsWith('video/');
        
        setHasFile(true);
        setFileInfo({
          filename: `demand_${demandId}_file`,
          size: blob.size,
          mimeType: blob.type,
          isImage: isImage,
          isVideo: isVideo,
          blob: blob,
          fileUrl: fileUrl,
          imageUrl: isImage ? fileUrl : null,
          videoUrl: isVideo ? fileUrl : null
        });
        
        // 设置预览URL
        if (isImage) {
          setImageUrl(fileUrl);
        }
      } else {
        setHasFile(false);
        setFileInfo(null);
        setImageUrl(null);
      }
    } catch (error) {
      //console.error('检查文件状态失败:', error);
      setHasFile(false);
      setFileInfo(null);
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时检查文件状态
  useEffect(() => {
    if (demandId) {
      checkFileStatus();
    }
    
    // 清理函数，释放URL对象
    return () => {
      if (imageUrl) {
        window.URL.revokeObjectURL(imageUrl);
      }
    };
  }, [demandId]);

  // 文件下载处理
  const handleDownload = async () => {
    if (!demandId) {
      message.error('需求ID不能为空');
      return;
    }

    try {
      const response = await getLatestDemandFile(demandId, true);
      
      // 创建临时链接进行下载
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `demand_${demandId}_file`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('开始下载文件');
    } catch (error) {
      //console.error('文件下载失败:', error);
      message.error('文件下载失败: ' + (error.message || '未知错误'));
    }
  };

  // 文件详情查看
  const handleViewDetails = () => {
    setPreviewVisible(true);
    // 图片URL已经在checkFileStatus中设置了
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (!bytes) return '未知大小';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 获取文件类型标签颜色
  const getFileTypeColor = (mimeType) => {
    if (!mimeType) return 'default';
    if (mimeType.startsWith('image/')) return 'green';
    if (mimeType.startsWith('video/')) return 'blue';
    if (mimeType.startsWith('audio/')) return 'purple';
    if (mimeType.includes('pdf')) return 'red';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'orange';
    return 'default';
  };

  return (
    <div className="demand-file-viewer">
      <Card
        title={title}
        loading={loading}
      >
        {hasFile && fileInfo ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            
            {/* 如果是图片，直接显示预览 */}
            {fileInfo.isImage && imageUrl && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Image
                  src={imageUrl}
                  alt={fileInfo.filename}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9'
                  }}
                  fallback="图片加载失败"
                  placeholder={
                    <div style={{ 
                      height: 200, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      color: '#999',
                      borderRadius: '4px'
                    }}>
                      <FileOutlined style={{ fontSize: '48px' }} />
                      <div>图片加载中...</div>
                    </div>
                  }
                />
              </div>
            )}

            {/* 如果是视频，显示视频播放器 */}
            {fileInfo.isVideo && fileInfo.videoUrl && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <video
                  src={fileInfo.videoUrl}
                  controls
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9'
                  }}
                  preload="metadata"
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
            )}
          </Space>
        ) : (
          !loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#999',
              background: '#fafafa',
              borderRadius: '6px',
              border: '1px dashed #d9d9d9'
            }}>
              <FileOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <div>暂无相关文件</div>
            </div>
          )
        )}
      </Card>

      {/* 文件详情模态框 */}
      <Modal
        title="文件详细信息"
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
        }}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={handleDownload}>
            下载文件
          </Button>,
          <Button key="close" onClick={() => {
            setPreviewVisible(false);
          }}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {fileInfo && (
          <div>
            {/* 如果是图片文件，显示图片预览 */}
            {fileInfo.isImage && imageUrl && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Image
                  src={imageUrl}
                  alt={fileInfo.filename}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px',
                    objectFit: 'contain'
                  }}
                  fallback="图片加载失败"
                  placeholder={
                    <div style={{ 
                      height: 200, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      color: '#999',
                      borderRadius: '4px'
                    }}>
                      <FileOutlined style={{ fontSize: '48px' }} />
                      <div>图片预览失败</div>
                    </div>
                  }
                />
              </div>
            )}

            {/* 如果是视频文件，显示视频预览 */}
            {fileInfo.isVideo && fileInfo.videoUrl && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <video
                  src={fileInfo.videoUrl}
                  controls
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px',
                    borderRadius: '6px'
                  }}
                  preload="metadata"
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
            )}
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="文件名">
                {fileInfo.filename}
              </Descriptions.Item>
              <Descriptions.Item label="文件类型">
                <Tag color={getFileTypeColor(fileInfo.mimeType)}>
                  {fileInfo.mimeType || '未知类型'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="文件大小">
                {formatFileSize(fileInfo.size)}
              </Descriptions.Item>
              <Descriptions.Item label="是否为图片">
                {fileInfo.isImage ? '是' : '否'}
              </Descriptions.Item>
              <Descriptions.Item label="是否为视频">
                {fileInfo.isVideo ? '是' : '否'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DemandFileViewer;