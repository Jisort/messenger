import React from 'react';
import clsx from 'clsx';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';
import {
    Settings as SettingsIcon,
    AccountCircle as AccountCircleIcon,
    Contacts as ContactsIcon,
    ExitToApp as ExitToAppIcon,
    Message as MessageIcon,
    Assessment as AssessmentIcon
} from '@material-ui/icons';
import {Tooltip} from "@material-ui/core";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
}));

export default function MiniDrawer(props) {
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const upper_menu_items = [
        {
            label: 'Send message',
            icon: <MessageIcon/>,
            tooltipTitle: 'Send message',
            route: '/',
            badge: '',
            onClick: props['handleLinkClick']
        }, {
            label: 'Address book',
            icon: <ContactsIcon/>,
            tooltipTitle: 'Address book',
            route: '/addressBook',
            badge: '',
            onClick: props['handleLinkClick']
        }, {
            label: 'Reports',
            icon: <AssessmentIcon/>,
            tooltipTitle: 'view reports',
            route: '/customReports',
            onClick: props['handleLinkClick']
        }
    ];

    const lower_menu_items = [
        {
            label: 'Profile',
            icon: <AccountCircleIcon/>,
            tooltipTitle: 'my profile',
            route: '/',
            badge: '',
            onClick: props['handleLinkClick']
        },
        {
            label: 'Logout',
            icon: <ExitToAppIcon/>,
            tooltipTitle: 'exit app',
            route: '/',
            badge: '',
            onClick: props['handleLogout']
        }
    ];

    return (
        <div className={classes.root}>
            <CssBaseline/>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" noWrap className="clickable"
                                onClick={(e) => props['handleLinkClick'](e, '/')}
                    >
                        {props['brand_name']}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                    </IconButton>
                </div>
                <Divider/>
                <List>
                    {upper_menu_items.map((item, index) => (
                        <ListItem button key={index} onClick={(e) => item['onClick'](e, item['route'])}>
                            <Tooltip title={item['tooltipTitle']}>
                                <ListItemIcon>
                                    <div>{item['icon']}{item['badge']}</div>
                                </ListItemIcon>
                            </Tooltip>
                            <ListItemText primary={item['label']}/>
                        </ListItem>
                    ))}
                </List>
                <Divider/>
                <List>
                    {lower_menu_items.map((item, index) => (
                        <ListItem button key={index} onClick={(e) => item['onClick'](e, item['route'])}>
                            <Tooltip title={item['tooltipTitle']}>
                                <ListItemIcon>
                                    <div>{item['icon']}{item['badge']}</div>
                                </ListItemIcon>
                            </Tooltip>
                            <ListItemText primary={item['label']}/>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.toolbar}/>
                {props.children}
            </main>
        </div>
    );
}
