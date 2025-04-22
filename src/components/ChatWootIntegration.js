import React, { useEffect } from 'react';

const ChatWootIntegration = () => {
  useEffect(() => {
    const BASE_URL = "http://20.29.23.53:3000";
    const script = document.createElement("script");
    script.src = `${BASE_URL}/packs/js/sdk.js`;
    script.defer = true;
    script.async = true;
    
    script.onload = () => {
      window.chatwootSDK.run({
        websiteToken: process.env.REACT_APP_WEBSITE_TOKEN,
        baseUrl: BASE_URL
      });
    };

    document.head.appendChild(script);

    // Clean up the script when the component is unmounted
    return () => {
      document.head.removeChild(script);
    };
  }, []);
};

export default ChatWootIntegration;
