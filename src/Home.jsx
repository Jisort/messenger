import React, {Component, Fragment} from "react";
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
import {
    Grid, TextField, Button,
    FormControl, Typography, Fab
} from "@material-ui/core";
import AppLoadingIndicator from "./components/AppLoadingIndicator";
import ComponentLoadingIndicator from "./components/ComponentLoadingIndicator";
import FormFeedbackMessage from "./components/FormFeedbackMessage";
import FormActivityIndicator from "./components/FormActivityIndicator";
import $ from "jquery";
import {postAPIRequest} from "./functions/APIRequests";
import {Payment} from '@material-ui/icons';
import FormModal from "./components/FormModal";
import FormTopUp from "./units/FormTopUp";
import Select from "@appgeist/react-select-material-ui";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null,
            top_up_dialogue_open: false,
            recipients_array: [],
            contacts_match: []
        };
    }

    componentDidMount() {
        this.fetchUrlData('organization_url', '/registration/organizations/');
        this.fetchUrlData('contacts_url', '/messenger/contacts/');
        this.fetchUrlData('address_books_url', '/messenger/address_books/');
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
        let recipients_array = this.state.recipients_array;
        let recipients = [];
        recipients_array.forEach(function (recipient) {
            recipients.push(recipient['value']);
        });
        payload['recipients'] = recipients.join(',');
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

    handleCloseDialogue = (form) => {
        this.setState({
            [form]: false
        })
    };

    handleOpenDialogue = (form) => {
        this.setState({
            [form]: true
        })
    };

    handleRecipientsSearch = (contact_search) => {
        console.log(contact_search);
        if (contact_search) {
            const {contacts_data} = this.props;
            let contacts = contacts_data['items'];
            let contacts_match = [];
            contacts.forEach((contact) => {
                let search = contact_search.toLowerCase();
                let values = Object.values(contact);
                let flag = false
                values.forEach((val) => {
                    if (val) {
                        val = val.toString();
                        if (val.toLowerCase().indexOf(search) > -1) {
                            flag = true;
                            return;
                        }
                    }
                });
                if (flag) {
                    contacts_match.push({
                        value: contact['phone_number'],
                        label: contact['phone_number'] + ' ' + contact['full_name'],
                    });
                }
            });
            return contacts_match;
        }
    }

    handleRecipientsChange = (recipients_array) => {
        let previous_recipients = this.state.recipients_array || [];
        let unique_recipients_array = null;
        if (recipients_array) {
            if (previous_recipients.length < recipients_array.length) {
                let last_recipient_obj = recipients_array[recipients_array.length - 1];
                if (last_recipient_obj['label'].endsWith('(address book)')) {
                    const {contacts_data} = this.props;
                    let contacts = contacts_data['items'];
                    let address_book_contacts = contacts.filter(function (contact) {
                        return contact['address_book_list'].indexOf(last_recipient_obj['value']) !== -1
                    });
                    recipients_array.pop();
                    address_book_contacts.forEach(function (contact) {
                        recipients_array.push({
                            value: contact['phone_number'],
                            label: contact['phone_number'] + ' ' + contact['full_name'],
                        })
                    });
                }
            }
            // remove duplicates
            unique_recipients_array = [...new Map(recipients_array.map(item => [item['value'], item])).values()];
        }
        this.setState({
            recipients_array: unique_recipients_array,
        });
    };

    render() {
        const promiseOptions = inputValue =>
            new Promise(resolve => {
                setTimeout(() => {
                    resolve(this.handleRecipientsSearch(inputValue));
                }, 1000);
            });
        const {organization_data, address_books_data, contacts_data} = this.props;
        let address_books = address_books_data['items'];
        let address_books_list = address_books.map(function (book) {
            return {
                value: book['id'],
                label: book['book_name'] + '(address book)',
            }
        });
        let recipients_list = address_books_list.concat(this.state.contacts_match);
        let organization = organization_data['items'][0] || {};
        if (this.state.loading) {
            return <AppLoadingIndicator/>;
        } else if (organization_data['isFetching'] ||
            contacts_data['isFetching'] ||
            address_books_data['isFetching']) {
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
                                <Fragment>
                                    <Select
                                        id="value"
                                        label="Recipients"
                                        defaultOptions={recipients_list}
                                        value={this.state.recipients_array}
                                        onChange={(value) => this.handleRecipientsChange(value)}
                                        isAsync
                                        isClearable
                                        isCreatable
                                        isMulti
                                        loadOptions={promiseOptions}
                                    />
                                </Fragment>
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
                            <Typography variant="body1" display="block" gutterBottom
                                        style={{fontWeight: 'bold'}}>
                                balance: {organization['sms_units']}
                                <Fab variant="extended" color="default" size="small"
                                     onClick={() => this.handleOpenDialogue('top_up_dialogue_open')}>
                                    <Payment color="primary"/>
                                    top-up
                                </Fab>
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <FormModal
                    handleClickOpen={() => this.handleOpenDialogue('top_up_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('top_up_dialogue_open')}
                    open={this.state.top_up_dialogue_open}
                    title="Top-up"
                >
                    <FormTopUp
                        handleClose={() => this.handleCloseDialogue('top_up_dialogue_open')}
                    />
                </FormModal>
            </Grid>
        );
    }
}

Home.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    organization_data: PropTypes.object.isRequired,
    contacts_data: PropTypes.object.isRequired,
    address_books_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const organization_data = retrieveUrlData('organization_url', dataByUrl);
    const contacts_data = retrieveUrlData('contacts_url', dataByUrl);
    const address_books_data = retrieveUrlData('address_books_url', dataByUrl);

    return {
        sessionVariables,
        organization_data,
        contacts_data,
        address_books_data
    }
}

export default connect(mapStateToProps)(withRouter(Home))
