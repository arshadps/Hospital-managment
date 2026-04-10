import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: 'transparent',
            color: '#6c757d',
            textAlign: 'center',
            padding: '20px 0',
            fontSize: '13px',
            width: '100%',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            marginTop: '20px'
        }}>
            <p style={{margin: 0, fontWeight: '500'}}>&copy; {new Date().getFullYear()} Hospital Booking System. All Rights Reserved.</p>
            <p style={{margin: '4px 0 0 0', opacity: 0.8}}>Ensuring balanced schedules and promoting efficient patient care natively.</p>
        </footer>
    );
};

export default Footer;
