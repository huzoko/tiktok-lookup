import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Loader } from './Loader';

interface SearchInputProps {
  onSearch: (input: string) => void;
  isLoading: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <div className="search-container" id="search-container">
      <form onSubmit={handleSubmit} className="input-wrapper" id="search-form">
        <span className="input-prefix" id="input-prefix">@</span>
        <input
          type="text"
          placeholder="username or profile URL"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
          id="search-input"
        />
        <button type="submit" disabled={isLoading || !value.trim()} id="search-button">
          {isLoading ? <Loader /> : 'CHECK'}
        </button>
      </form>
      {isLoading && (
        <div className="loading-bar" id="loading-bar">
          <div className="loading-progress" id="loading-progress"></div>
        </div>
      )}
    </div>
  );
};
