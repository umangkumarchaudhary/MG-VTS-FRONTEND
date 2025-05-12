import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const roles = [
  'Admin',
  'Technician',
  'Service Advisor',
  'Quality Inspector',
  'Job Controller',
  'Washing',
  'Security Guard',
  'Driver',
  'Parts Team'
];

const UserAuth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    team: 'Default',
    password: ''
  });
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? '/api/register' : '/api/login';
    const body = isRegister
      ? formData
      : { phone: formData.phone, password: formData.password };

    try {
      const res = await fetch(`https://mg-vts-backend.onrender.com${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert(`${isRegister ? 'Registered' : 'Logged in'} successfully as ${data.user.role}`);

      // Redirect based on role
      switch (data.user.role) {
        case 'Job Controller':
          navigate('/job-controller-dashboard');
          break;
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        case 'Technician':
          navigate('/technician-dashboard');
          break;
        case 'Service Advisor':
          navigate('/service-advisor-dashboard');
          break;
        case 'Security Guard':
          navigate('/security-dashboard');
          break;
        case 'Washing':
          navigate('/washing-dashboard');
          break;
        case 'Quality Inspector':
          navigate('/quality-inspector-dashboard');
          break;
        case 'Driver':
          navigate('/driver-dashboard');
          break;
        case 'Parts Team':
          navigate('/parts-dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {isRegister && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Email (optional)"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
            <select name="role" value={formData.role} onChange={handleChange} required style={styles.input}>
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select name="team" value={formData.team} onChange={handleChange} style={styles.input}>
              <option value="Default">Default</option>
              <option value="A">Team A</option>
              <option value="B">Team B</option>
              <option value="None">None</option>
            </select>
          </>
        )}
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          required
          value={formData.phone}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}
        <button onClick={() => setIsRegister(!isRegister)} style={styles.linkBtn}>
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>

      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    width: 300,
    margin: 'auto',
    marginTop: 50,
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 10,
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  input: {
    padding: 8,
    fontSize: 14
  },
  button: {
    padding: 10,
    fontWeight: 'bold',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  linkBtn: {
    marginLeft: 10,
    background: 'none',
    color: '#007bff',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline'
  }
};

export default UserAuth;