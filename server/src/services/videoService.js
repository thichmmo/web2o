const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

class VideoService {
  async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  async validateVideo(filePath) {
    try {
      const metadata = await this.getVideoMetadata(filePath);

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        return {
          valid: false,
          error: 'No video stream found',
        };
      }

      const duration = parseFloat(metadata.format.duration);
      const fileSize = parseInt(metadata.format.size);

      // Facebook video requirements
      const minDuration = 1; // 1 second
      const maxDuration = 240 * 60; // 240 minutes
      const maxFileSize = 10 * 1024 * 1024 * 1024; // 10GB

      if (duration < minDuration) {
        return {
          valid: false,
          error: `Video too short. Minimum duration is ${minDuration} second`,
        };
      }

      if (duration > maxDuration) {
        return {
          valid: false,
          error: `Video too long. Maximum duration is ${maxDuration / 60} minutes`,
        };
      }

      if (fileSize > maxFileSize) {
        return {
          valid: false,
          error: `File too large. Maximum size is ${maxFileSize / (1024 ** 3)}GB`,
        };
      }

      return {
        valid: true,
        metadata: {
          duration,
          fileSize,
          width: videoStream.width,
          height: videoStream.height,
          codec: videoStream.codec_name,
          bitrate: metadata.format.bit_rate,
        },
      };
    } catch (error) {
      console.error('Video validation error:', error);
      return {
        valid: false,
        error: 'Failed to validate video',
      };
    }
  }

  async generateThumbnail(videoPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '320x240',
        })
        .on('end', () => resolve(outputPath))
        .on('error', reject);
    });
  }

  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  deleteFiles(filePaths) {
    return filePaths.map(filePath => this.deleteFile(filePath));
  }
}

module.exports = new VideoService();
