import React from 'react';

const Footer = () => {
  return (
    <footer>
      <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        Copyright © 2017-2025 - Trường Đại học Công nghệ Thông tin & Truyền Thông Việt - Hàn, Đại học Đà Nẵng
      </p>
      <p>
        <span role="img" aria-label="home">🏠</span>
        Địa chỉ: Khu Đô thị Đại học Đà Nẵng, Đường Nam Kỳ Khởi Nghĩa, quận Ngũ Hành Sơn, TP. Đà Nẵng
      </p>
      <p>
        <span role="img" aria-label="phone">📞</span> 
        Điện thoại: 0236.6.552.688 
        <span style={{ marginLeft: '10px' }} role="img" aria-label="email">✉️</span> 
        daotao@vku.udn.vn
      </p>
    </footer>
  );
};

export default Footer;
