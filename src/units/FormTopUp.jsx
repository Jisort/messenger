import React, {Component} from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {Grid, DialogContent, TextField, DialogActions, Button, Typography} from "@material-ui/core";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import FormActivityIndicator from "../components/FormActivityIndicator";
import $ from 'jquery';
import {serverBaseUrl} from "../functions/baseUrls";
import {postAPIRequest} from "../functions/APIRequests";
import {extractResponseError, formDataToPayload} from "../functions/componentActions";
import {fetchDataIfNeeded, invalidateData} from "../actions/actions";


class FormTopUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null,
            selected_date: new Date()
        }
    }

    handleTopUpSubmit(e) {
        e.preventDefault();
        this.setState({
            activity: true
        });
        let formData = new FormData($('form#top-up-form')[0]);
        let payload = {
            sms_topup: true
        };
        payload = formDataToPayload(formData, payload);
        let top_up_url = serverBaseUrl() + '/messenger/outbox/';
        postAPIRequest(top_up_url,
            () => {
                this.setState({
                    message: true,
                    message_text: 'Top-up done successfully',
                    message_variant: 'success',
                    activity: false
                });
                const {sessionVariables, dispatch} = this.props;
                let organization_url = sessionVariables['organization_url'] || '';
                dispatch(invalidateData(organization_url));
                dispatch(fetchDataIfNeeded(organization_url));
                $("form#top-up-form")[0].reset();
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
        );
    }

    render() {
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }
        let top_up_button = <DialogActions>
            <Button color="primary" type="submit">
                Top-up
            </Button>
            <Button onClick={this.props['handleClose']} color="primary">
                Close
            </Button>
        </DialogActions>;
        if (this.state.activity) {
            top_up_button = <FormActivityIndicator/>;
        }
        return (
            <Grid container>
                <Grid item xs={12}>
                    {message}
                    <form
                        onSubmit={(e) => this.handleTopUpSubmit(e)}
                        id="top-up-form">
                        <DialogContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="body1" display="block" gutterBottom
                                                style={{fontWeight: 'bold'}}>
                                        M-Pesa till number: 929230
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Phone number"
                                               name="phone_number" required={true}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField fullWidth type="amount"
                                               label="Amount" name="amount"
                                               required={true}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        {top_up_button}
                    </form>
                </Grid>
            </Grid>
        )
    }
}

FormTopUp.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {sessionVariables} = state;

    return {
        sessionVariables,
    }
}

export default connect(mapStateToProps)(withRouter(FormTopUp))
