import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SubjectSelector.css';
import Footer from './Footer';

function SubjectSelector() {
  const [count, setCount] = useState(0);
  const [subjectInput, setSubjectInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [noteText, setNoteText] = useState('');
  const suggestionBoxRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage when component mounts
    localStorage.removeItem('schedule_payload');
  }, []);

  const handleInputChange = (e) => {
    const query = e.target.value.trim();
    setSubjectInput(query);

    if (!query) {
      setSuggestions([]);
      return;
    }

    const payload = { query };

    // ('http://127.0.0.1:8001/api/search-recommend'
    fetch('http://20.29.23.53:8001/api/search-recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) throw new Error('Lỗi từ server!');
        return response.json();
      })
      .then(data => {
        const seen = new Set();
        const filteredResults = (data.results || [])
          .map(item => {
            const courseName = item.course_name ? String(item.course_name).trim() : '';
            const subTopic = item.sub_topic ? String(item.sub_topic).trim() : '';

            if (!courseName) return null;

            const suggestionText = subTopic ? `${courseName} @ ${subTopic}` : courseName;

            if (seen.has(suggestionText)) return null;
            seen.add(suggestionText);

            return suggestionText;
          })
          .filter(Boolean);

        setSuggestions(filteredResults.length > 0 ? filteredResults : ['Không tìm thấy kết quả phù hợp.']);
      })
      .catch(error => {
        console.error('❌ Lỗi khi gọi API:', error);
        setSuggestions(['Không thể tải gợi ý...']);
      });
  };

  const addSubject = (name) => {
    const existing = subjects.some(subject => subject.name === name);
    if (existing) return;

    setSubjects([...subjects, { 
      id: count + 1, 
      name, 
      want: false 
    }]);
    
    setCount(count + 1);
    setSubjectInput('');
    setSuggestions([]);
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    // Update IDs to be sequential
    setSubjects(prev => prev.map((subject, idx) => ({ ...subject, id: idx + 1 })));
    setCount(prev => prev - 1);
  };

  const toggleWant = (id) => {
    setSubjects(subjects.map(subject => 
      subject.id === id ? { ...subject, want: !subject.want } : subject
    ));
  };

  const submitForm = () => {
    const queries = subjects
      .filter(subject => subject.want)
      .map(subject => subject.name);

    const payload = {
      queries: queries,
      prompt: noteText.trim()
    };

    localStorage.setItem('schedule_payload', JSON.stringify(payload));
    navigate('/schedule');
  };

  return (
    <>
    <div className="container">
      <img 
        src="/logo_title_of_VKU.png" 
        alt="Logo VKU" 
        style={{ display: 'block', margin: '0 auto 20px', maxWidth: 'inherit' }} 
      />


      <h2>HÃY CHO CHÚNG TÔI BIẾT:</h2>

      <label htmlFor="subject">Môn Học</label>
      <input 
        type="text" 
        id="subject" 
        placeholder="Nhập tên môn học"
        value={subjectInput}
        onChange={handleInputChange}
        autoComplete="off"
      />
      
      {suggestions.length > 0 && (
        <ul id="suggestionBox" ref={suggestionBoxRef}>
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              onClick={() => {
                if (suggestion !== 'Không tìm thấy kết quả phù hợp.' && 
                    suggestion !== 'Không thể tải gợi ý...') {
                  addSubject(suggestion);
                }
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      <table id="subjectTable">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Môn Học</th>
            <th>Không học</th>
            <th>Muốn học</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(subject => (
            <tr key={subject.id}>
              <td>{subject.id}</td>
              <td>{subject.name}</td>
              <td>
                <button className="toggle-btn none" onClick={() => removeSubject(subject.id)}>❌</button>
              </td>
              <td>
                <button 
                  className={`toggle-btn ${subject.want ? 'want' : 'none'}`} 
                  onClick={() => toggleWant(subject.id)}
                >
                  ✔️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="note">
        <label htmlFor="note-text">CHÚ THÍCH THÊM</label>
        <textarea 
          id="note-text" 
          placeholder="VD: Muốn học buổi sáng, tiết 1,2 hoặc thêm môn Giải tích..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
      </div>

      <button className="submit-btn" onClick={submitForm}>Hãy lập tkb cho tôi</button>

      
      
    </div>
    <Footer />
    </>
    

    
  );
}

export default SubjectSelector;