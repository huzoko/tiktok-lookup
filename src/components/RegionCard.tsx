
import React from 'react';
import { TikTokAccountInfo } from '../types/tiktok';
import { Underline } from 'lucide-react';

interface RegionCardProps {
  info: TikTokAccountInfo;
}

export const RegionCard: React.FC<RegionCardProps> = ({ info }) => {
  const requestId = `8824-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  
  return (
    <div className="result-card" id="result-card">
      <div className="origin-label" id="origin-label">Account Metadata</div>
      
      <div className="profile-section" id="profile-section">
        <img src={info.avatar} alt={info.nickname} className="avatar" id="profile-avatar" referrerPolicy="no-referrer" />
        <div className="user-meta" id="user-meta">
          <span className="nickname" id="nickname">{info.nickname}</span>
          <span className="username-display" id="username-display">@{info.username}</span>
        </div>
      </div>

      <p className="bio" id="user-bio">{info.bio}</p>

      <div className="stats-grid" id="stats-grid">
        <div className="stat-item" id="stat-followers">
          <span className="stat-value">{info.followers}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-item" id="stat-following">
          <span className="stat-value">{info.following}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat-item" id="stat-likes">
          <span className="stat-value">{info.likes}</span>
          <span className="stat-label">Likes</span>
        </div>
        <div className="stat-item" id="stat-videos">
          <span className="stat-value">{info.videos}</span>
          <span className="stat-label">Videos</span>
        </div>
      </div>

      <div className="origin-label" id="region-label" style={{ marginTop: '0', marginBottom: '12px' }}>Account Origin</div>
      <div className="result-header" id="result-header" style={{ marginBottom: '20px' }}>
        <div className="flag" id="flag-emoji">{info.flag}</div>
        <h2 className="country-name" id="country-name">{info.countryName}</h2>
      </div>

      <div className="tags" id="result-tags">
        <span className="tag">Region: {info.countryCode}</span>
      </div>

      <a 
        href={info.profileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="account-link"
        id="profile-link"
        style={{ marginBottom: '20px', textDecoration: 'underline' }}
      >
        VIEW ON TIKTOK
      </a>

      <div className="result-footer" id="result-footer">
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span className="status-text">Data retrieved successfully</span>
        </div>
        <div className="request-id">REQ_ID: {requestId}</div>
      </div>
    </div>
  );
};
