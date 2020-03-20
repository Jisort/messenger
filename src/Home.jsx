import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {serverBaseUrl} from "./functions/baseUrls";
import {
    setSessionVariable,
    fetchDataIfNeeded,
    invalidateData
} from './actions/actions';
import {formDataToPayload, getUrlData, extractResponseError} from "./functions/componentActions";
import {Grid, TextField, Button, FormControl, Typography} from "@material-ui/core";
import AppLoadingIndicator from "./components/AppLoadingIndicator";
import ComponentLoadingIndicator from "./components/ComponentLoadingIndicator";
import FormFeedbackMessage from "./components/FormFeedbackMessage";
import FormActivityIndicator from "./components/FormActivityIndicator";
import $ from "jquery";
import {postAPIRequest} from "./functions/APIRequests";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null
        };
    }

    componentDidMount() {
        this.fetchUrlData('organization_url', '/registration/organizations/');
    }

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    handleSubmitSendMessage(e) {
        e.preventDefault();
        this.setState({
            activity: true
        })
        let formData = new FormData($('form#send-message-form')[0]);
        let payload = {};
        payload = formDataToPayload(formData, payload);
        let send_message_url = serverBaseUrl() + '/messenger/outbox/';
        postAPIRequest(
            send_message_url,
            () => {
                this.setState({
                    message: true,
                    message_text: 'Message sent successfully',
                    message_variant: 'success',
                    activity: false
                });
                $("form#send-message-form")[0].reset();
                const {sessionVariables, dispatch} = this.props;
                let organization_url = sessionVariables['organization_url'] || '';
                dispatch(invalidateData(organization_url));
                dispatch(fetchDataIfNeeded(organization_url));
            },
            (results) => {
                let alert_message = extractResponseError(results);
                this.setState({
                    message: true,
                    message_text: alert_message,
                    message_variant: 'error',
                    activity: false
                });
            },
            payload,
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        )
    }

    render() {
        const {organization_data} = this.props;
        let organization = organization_data['items'][0] || {};
        if (this.state.loading) {
            return <AppLoadingIndicator/>;
        } else if (organization_data['isFetching']) {
            return <ComponentLoadingIndicator/>;
        }
        let send_message_button = <Button variant="contained" color="primary" type="submit">
            Send message
        </Button>;
        if (this.state.activity) {
            send_message_button = <FormActivityIndicator/>;
        }
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            {message}
                        </Grid>
                    </Grid>
                    <form onSubmit={(e) => this.handleSubmitSendMessage(e)}
                          id="send-message-form">
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Recipients"
                                    name="recipients"
                                    variant="outlined"
                                    required={true}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Message"
                                    name="message"
                                    multiline
                                    rows="10"
                                    variant="outlined"
                                    required={true}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    {send_message_button}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography  variant="body1" display="block" gutterBottom>
                                balance: {organization['sms_units']}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

Home.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    organization_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const organization_data = retrieveUrlData('organization_url', dataByUrl);

    return {
        sessionVariables,
        organization_data
    }
}

export default connect(mapStateToProps)(withRouter(Home))
