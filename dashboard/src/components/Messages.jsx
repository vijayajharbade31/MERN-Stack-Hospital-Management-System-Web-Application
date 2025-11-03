import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { MdDelete, MdCheckCircle, MdDoneAll } from "react-icons/md";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { isAuthenticated } = useContext(Context);
  
  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/message/getall",
        { withCredentials: true }
      );
      setMessages(data.messages);
    } catch (error) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/v1/message/mark-as-read/${id}`,
        {},
        { withCredentials: true }
      );
      toast.success("Message marked as read!");
      fetchMessages(); // Refresh messages
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark as read");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/v1/message/delete/${id}`,
          { withCredentials: true }
        );
        toast.success("Message deleted successfully!");
        fetchMessages(); // Refresh messages
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete message");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/v1/message/mark-all-read",
        {},
        { withCredentials: true }
      );
      toast.success("All messages marked as read!");
      fetchMessages(); // Refresh messages
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark all as read");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <section className="page messages" style={{ padding: '2rem', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '2rem', 
        borderRadius: '16px', 
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', margin: 0, marginBottom: '0.5rem' }}>
              MESSAGES
            </h1>
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ff9800',
                color: 'white',
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {unreadCount} Unread Message{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '15px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
              }}
            >
              <MdDoneAll size={20} />
              Mark All as Read
            </button>
          )}
        </div>
      </div>
      <div className="banner">
        {messages && messages.length > 0 ? (
          messages.map((element) => {
            return (
              <div 
                key={element._id}
                style={{
                  backgroundColor: element.isRead ? 'white' : '#e3f2fd',
                  borderLeft: element.isRead ? '3px solid #ddd' : '4px solid #2196F3',
                  padding: '2rem',
                  marginBottom: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: element.isRead 
                    ? '0 2px 10px rgba(0,0,0,0.08)' 
                    : '0 8px 25px rgba(33, 150, 243, 0.15)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(33, 150, 243, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = element.isRead 
                    ? '0 2px 10px rgba(0,0,0,0.08)' 
                    : '0 8px 25px rgba(33, 150, 243, 0.15)';
                }}
              >
                {/* Unread indicator */}
                {!element.isRead && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderBottomLeftRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    NEW
                  </div>
                )}

                {/* Message Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: element.isRead ? '0' : '1.5rem' }}>
                      <div>
                        <p style={{ margin: '0.75rem 0', fontSize: '15px', color: '#666' }}>
                          <strong style={{ color: '#333', display: 'inline-block', width: '120px' }}>First Name:</strong>
                          <span style={{ fontWeight: '600', color: '#2196F3' }}>{element.firstName}</span>
                        </p>
                        <p style={{ margin: '0.75rem 0', fontSize: '15px', color: '#666' }}>
                          <strong style={{ color: '#333', display: 'inline-block', width: '120px' }}>Last Name:</strong>
                          <span style={{ fontWeight: '600', color: '#2196F3' }}>{element.lastName}</span>
                        </p>
                        <p style={{ margin: '0.75rem 0', fontSize: '15px', color: '#666' }}>
                          <strong style={{ color: '#333', display: 'inline-block', width: '120px' }}>Email:</strong>
                          <span style={{ color: '#667eea' }}>{element.email}</span>
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0.75rem 0', fontSize: '15px', color: '#666' }}>
                          <strong style={{ color: '#333', display: 'inline-block', width: '120px' }}>Phone:</strong>
                          <span style={{ fontWeight: '600', color: '#2196F3' }}>{element.phone}</span>
                        </p>
                        {element.createdAt && (
                          <p style={{ margin: '0.75rem 0', fontSize: '15px', color: '#666' }}>
                            <strong style={{ color: '#333', display: 'inline-block', width: '120px' }}>Received:</strong>
                            <span style={{ color: '#999', fontSize: '14px' }}>{new Date(element.createdAt).toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div style={{
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  borderLeft: '4px solid #667eea'
                }}>
                  <p style={{ margin: '0.5rem 0', fontSize: '14px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Message:
                  </p>
                  <p style={{ margin: '0.75rem 0 0 0', fontSize: '16px', color: '#333', lineHeight: '1.6', fontStyle: 'italic' }}>
                    "{element.message}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  {!element.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(element._id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
                      }}
                      title="Mark as read"
                    >
                      <MdCheckCircle size={18} />
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMessage(element._id)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(244, 67, 54, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.4)';
                    }}
                    title="Delete message"
                  >
                    <MdDelete size={18} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '5rem 2rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <h1 style={{ color: '#999', fontSize: '1.5rem', margin: 0 }}>No Messages Available</h1>
          </div>
        )}
      </div>
    </section>
  );
};

export default Messages;
