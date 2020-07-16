import React, {Component, Fragment} from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {Grid, DialogContent, DialogActions, Button, Link, Box} from "@material-ui/core";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import FormActivityIndicator from "../components/FormActivityIndicator";
import $ from 'jquery';
import {serverBaseUrl} from "../functions/baseUrls";
import {postFormAPIRequest} from "../functions/APIRequests";
import {
    extractResponseError,
    getUrlData,
    addressBookToPayload
} from "../functions/componentActions";
import {fetchDataIfNeeded, invalidateData, setSessionVariable} from "../actions/actions";
import Select from "@appgeist/react-select-material-ui";
import ContactsTemplate from "./contacts.xlsx";

class FormUploadContacts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: false,
            message: false,
            message_variant: 'info',
            message_text: null,
            selected_address_books: [],
            contacts_file_name: '',
        }
    }

    componentDidMount() {
        this.fetchUrlData('address_books_url', '/messenger/address_books/');
    }

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    handleRefreshContacts = () => {
        this.props.tableRef.current && this.props.tableRef.current.onQueryChange();
    }

    handleContactsUploadSubmit(e) {
        e.preventDefault();
        this.setState({
            activity: true
        });
        let formData = new FormData($('form#upload-contacts-form')[0]);
        let selected_address_books = this.state.selected_address_books;
        let book_array = addressBookToPayload(selected_address_books);
        let book = book_array[0];
        let book_name = book_array[1];
        formData.append('book_name', book_name.join(','));
        formData.append('book', book.join(','));
        let upload_contacts_url = serverBaseUrl() + '/messenger/contacts/';
        postFormAPIRequest(upload_contacts_url,
            () => {
                this.setState({
                    message: true,
                    message_text: 'Contacts uploaded successfully',
                    message_variant: 'success',
                    activity: false
                });
                const {sessionVariables, dispatch} = this.props;
                let address_books_url = sessionVariables['address_books_url'] || '';
                let contacts_url = sessionVariables['contacts_url'] || '';
                dispatch(invalidateData(address_books_url));
                dispatch(fetchDataIfNeeded(address_books_url));
                dispatch(invalidateData(contacts_url));
                dispatch(fetchDataIfNeeded(contacts_url));
                $("form#upload-contacts-form")[0].reset();
                this.handleRefreshContacts();
            },
            (results) => {
                let alert_message = extractResponseError(results);
                this.setState({
                    message: true,
                    message_text: alert_message,
                    message_variant: 'error',
                    activity: false
                });
                const {sessionVariables, dispatch} = this.props;
                let address_books_url = sessionVariables['address_books_url'] || '';
                dispatch(invalidateData(address_books_url));
                dispatch(fetchDataIfNeeded(address_books_url));
                this.handleRefreshContacts();
            },
            formData,
            {
                'Authorization': 'Bearer ' + localStorage.token
            }
        );
    }

    handleAddressBookChange = (books_array) => {
        this.setState({
            selected_address_books: books_array,
        });
    };

    handleContactsFileChange = (contacts_file) => {
        let contacts_file_name = contacts_file.split('\\').pop();
        this.setState({
            contacts_file_name: contacts_file_name
        });
    }

    render() {
        let message = '';
        const {address_books_data} = this.props;
        let address_books = address_books_data['items'];
        let address_books_list = address_books.map(function (book) {
            return {
                value: book['id'],
                label: book['book_name'],
            }
        });
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }
        let upload_button = <DialogActions>
            <Button color="primary" type="submit">
                Upload
            </Button>
            <Button onClick={this.props['handleClose']} color="primary">
                Close
            </Button>
        </DialogActions>;
        if (this.state.activity) {
            upload_button = <FormActivityIndicator/>;
        }
        return (

            <Grid container>
                <Grid item xs={12}>
                    {message}
                    <form
                        onSubmit={(e) => this.handleContactsUploadSubmit(e)}
                        id="upload-contacts-form">
                        <DialogContent>
                            <Box height="30vh">
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="contained"
                                            component="label"
                                        >
                                            contacts excel file
                                            <input
                                                type="file"
                                                name="contacts_csv"
                                                onChange={event => this.handleContactsFileChange(event.target.value)}
                                                style={{display: "none"}}
                                            />
                                        </Button>
                                        <Link href="#">
                                            {this.state.contacts_file_name}
                                        </Link>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Link href={ContactsTemplate}>
                                            Download template
                                        </Link>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Fragment>
                                            <Select
                                                id="value"
                                                label="Address book"
                                                options={address_books_list}
                                                value={this.state.selected_address_books}
                                                onChange={(value) => this.handleAddressBookChange(value)}
                                                isClearable
                                                isCreatable
                                                isMulti
                                            />
                                        </Fragment>
                                    </Grid>
                                </Grid>
                            </Box>
                        </DialogContent>
                        {upload_button}
                    </form>
                </Grid>
            </Grid>
        )
    }
}

FormUploadContacts.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    address_books_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const address_books_data = retrieveUrlData('address_books_url', dataByUrl);

    return {
        sessionVariables,
        address_books_data
    }
}

export default connect(mapStateToProps)(withRouter(FormUploadContacts))
