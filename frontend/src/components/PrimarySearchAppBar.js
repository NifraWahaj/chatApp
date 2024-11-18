import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
  Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CustomNavBar = () => {
  const [userEmail, setUserEmail] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationMenuAnchorEl, setNotificationMenuAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:3001/get-user');
        setUserEmail(response.data.email);
      } catch (error) {
        console.error(error);
        setUserEmail('');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3001/auth/logout', { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3001/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = async (notification) => {
    notification.isRead = true;
    try {
      await axios.put(`http://localhost:3001/update-notification/${notification._id}`, notification);
    } catch (error) {
      console.error(error);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const deleteNotification = async (notification) => {
    try {
      await axios.delete(`http://localhost:3001/delete-notification/${notification._id}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n._id !== notification._id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProfile = async () => {
    try {
      await axios.delete('http://localhost:3001/delete-profile');
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    fetchNotifications();
    setNotificationMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationMenuAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';
  const notificationMenuId = 'notification-menu';

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={deleteProfile}>Delete Profile</MenuItem>
    </Menu>
  );

  const renderNotificationMenu = (
    <Menu
      anchorEl={notificationMenuAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={notificationMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(notificationMenuAnchorEl)}
      onClose={handleMenuClose}
    >
      <Divider />
      {notifications && notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <MenuItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2">{notification.message || 'No message available'}</Typography>
              {notification.link ? (
                <Typography
                  variant="body2"
                  color="primary"
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Go to Link
                </Typography>
              ) : (
                <Typography variant="body2">No link available</Typography>
              )}
            </Box>
            <IconButton
              size="small"
              color="error"
              onClick={() => deleteNotification(notification)}
            >
              <Typography variant="body2" color="error">
                Delete
              </Typography>
            </IconButton>
          </MenuItem>
        ))
      ) : (
        <MenuItem>No notifications</MenuItem>
      )}
    </Menu>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: '#7b7fd1' }}>
      <Toolbar>
        <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Buzz
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit"
          onClick={handleNotificationMenuOpen}
        >
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        {userEmail ? (
          <IconButton
            size="large"
            aria-label="logout"
            color="inherit"
            onClick={handleLogout}
          >
            <LogoutIcon />
          </IconButton>
        ) : (
          <Typography variant="body2" color="inherit">
            Loading...
          </Typography>
        )}
      </Toolbar>
      {renderMenu}
      {renderNotificationMenu}
    </AppBar>
  );
};

export default CustomNavBar;
