import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ScheduleDisplay.css';

function ScheduleDisplay() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState({
    subject: '',
    teacher: '',
    time: '',
    room: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const payload = JSON.parse(localStorage.getItem('schedule_payload'));

    if (!payload) {
      alert('⚠️ Không có dữ liệu truy vấn. Quay lại trang trước.');
      navigate('/');
      return;
    }

    fetch('http://127.0.0.1:5001/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Server responded with an error');
        return res.json();
      })
      .then(data => {
        setSchedules(data.schedules || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Lỗi API:', err);
        setError('Không thể tạo thời khóa biểu.');
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">🔄 Đang tạo thời khóa biểu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">❌ {error}</p>
        <button onClick={() => navigate('/')}>Quay lại</button>
      </div>
    );
  }

  const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const periodLabels = [
    'Tiết 1: 07h30',
    'Tiết 2: 08h30',
    'Tiết 3: 09h30',
    'Tiết 4: 10h30',
    'Tiết 5: 11h30',
    'Tiết 6: 13h00',
    'Tiết 7: 14h00',
    'Tiết 8: 15h00',
    'Tiết 9: 16h00',
    'Tiết 10: 17h00'
  ];
  const courseColors = ['darkgreen', 'darkbrown', 'navyblue', 'darkblue', 'darkred'];

  const renderTimeTable = (scheduleObj, index) => {
    const timetableData = scheduleObj.schedule;
    
    // Create color mapping for each course
    const courseColorMap = {};
    let colorIndex = 0;
    timetableData.forEach(courseData => {
      const courseName = courseData[0];
      if (!courseColorMap[courseName]) {
        courseColorMap[courseName] = courseColors[colorIndex % courseColors.length];
        colorIndex++;
      }
    });

    // Prepare a 2D grid to track rendered cells
    const rendered = Array.from({ length: 10 }, () =>
      Object.fromEntries(days.map(d => [d, false]))
    );

    return (
      <div className="timetable-container" key={index}>
        <h1>THỜI KHÓA BIỂU {index + 1}</h1>
        <div className="score-display">Điểm: {scheduleObj.score}</div>
        
        <div className="info-grid">
          <div className="info-block">
            <label>Tên HP:</label>
            <input value={selectedCourseInfo.subject} readOnly />
          </div>
          <div className="info-block">
            <label>Giáo viên:</label>
            <input value={selectedCourseInfo.teacher} readOnly />
          </div>
          <div className="info-block">
            <label>Thời gian:</label>
            <input value={selectedCourseInfo.time} readOnly />
          </div>
          <div className="info-block">
            <label>Phòng:</label>
            <input value={selectedCourseInfo.room} readOnly />
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Tiết</th>
              {days.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, periodIndex) => {
              const periodNumber = periodIndex + 1;
              
              return (
                <tr key={periodNumber}>
                  <td className="period-col">{periodLabels[periodIndex]}</td>
                  
                  {days.map(day => {
                    // Skip if cell is already rendered as part of a rowspan
                    if (rendered[periodIndex][day]) return null;
                    
                    // Check if there's a course in this time slot
                    for (const courseData of timetableData) {
                      const courseName = courseData[0];
                      const info = courseData[1];
                      
                      if (info.day !== day) continue;
                      
                      if (info.periods.includes(periodNumber)) {
                        const isStart = periodNumber === Math.min(...info.periods);
                        
                        if (isStart) {
                          const rowspan = info.periods.length;
                          const roomCode = `${info.area}.${info.room}`;
                          const subTopic = info.sub_topic?.trim() ?? '';
                          const courseInfo = `${courseName} (${info.class_index})${subTopic ? '_' + subTopic : ''}`;
                          
                          // Mark cells as rendered
                          for (let r = 0; r < rowspan; r++) {
                            if (periodIndex + r < 10) {
                              rendered[periodIndex + r][day] = true;
                            }
                          }
                          
                          return (
                            <td 
                              key={day}
                              className={`filled ${courseColorMap[courseName]}`}
                              rowSpan={rowspan}
                              onMouseOver={() => {
                                setSelectedCourseInfo({
                                  subject: courseInfo,
                                  teacher: info.teacher,
                                  time: `${periodLabels[info.periods[0] - 1].split(': ')[1]} - ${
                                    periodLabels[info.periods[info.periods.length - 1] - 1].split(': ')[1]
                                  }`,
                                  room: roomCode
                                });
                              }}
                              onMouseLeave={() => {
                                setSelectedCourseInfo({
                                  subject: '',
                                  teacher: '',
                                  time: '',
                                  room: ''
                                });
                              }}
                            >
                              {courseInfo}
                              <br />
                              <small>{roomCode}</small>
                            </td>
                          );
                        }
                        return null;
                      }
                    }
                    
                    // Empty cell
                    return <td key={day}></td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div id="wrapper">
      {schedules.map((schedule, index) => renderTimeTable(schedule, index))}
    </div>
  );
}

export default ScheduleDisplay;