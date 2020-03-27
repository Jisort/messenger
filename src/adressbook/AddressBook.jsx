import React, {Component} from "react";
import MaterialTable from "material-table";
import {serverBaseUrl} from "../functions/baseUrls";
import {fetchDataIfNeeded, invalidateData, setSessionVariable} from "../actions/actions";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {extractResponseError, getUrlData} from "../functions/componentActions";
import {postAPIRequest} from "../functions/APIRequests";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import AutocompleteSelect from "../components/AutocompleteSelect";

class AddressBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: false,
            message_variant: 'info',
            message_text: null
        }
    }

    componentDidMount() {
        this.fetchUrlData('contacts_url', '/messenger/contacts/');
        this.fetchUrlData('address_books_url', '/messenger/address_books/');
    }

    fetchUrlData = (var_name, url) => {
        const {dispatch} = this.props;
        url = serverBaseUrl() + url;
        this.props.dispatch(setSessionVariable(var_name, url));
        dispatch(fetchDataIfNeeded(url));
    };

    handleCreateContact = (contact_data) => {
        let send_message_url = serverBaseUrl() + '/messenger/contacts/';
        postAPIRequest(
            send_message_url,
            () => {
                this.setState({
                    message: true,
                    message_text: 'Contact created successfully',
                    message_variant: 'success',
                    activity: false
                });
                const {sessionVariables, dispatch} = this.props;
                let contacts_url = sessionVariables['contacts_url'] || '';
                let address_books_url = sessionVariables['address_books_url'] || '';
                dispatch(invalidateData(contacts_url));
                dispatch(fetchDataIfNeeded(contacts_url));
                dispatch(invalidateData(address_books_url));
                dispatch(fetchDataIfNeeded(address_books_url));
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
            contact_data,
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        )
    }

    handleAddressBookChange  = (book_object) => {
        this.setState({
            selected_address_book: book_object['value'],
        });
    };

    editAddressBookComponent = () => {
        const {address_books_data} = this.props;
        let address_books = address_books_data['items'];
        let address_books_list = address_books.map(function (book) {
            return {
                value: book['id'],
                label: book['book_name'],
                optionDisplay: book['book_name'],
            }
        });
        return <AutocompleteSelect
            label="Address book"
            optionLabel="label"
            data={address_books_list}
            onChange={(value) => this.handleAddressBookChange(value)}
        />
    }

    render() {
        const {contacts_data, address_books_data} = this.props;
        let contacts = contacts_data['items'];
        let address_books = address_books_data['items'];
        let address_book_lookup = {}
        address_books.forEach(function (book) {
            address_book_lookup[book.id] = book['book_name'];
        });
        let message = '';
        if (this.state.message) {
            message = <FormFeedbackMessage
                message_variant={this.state.message_variant}
                message_text={this.state.message_text}
            />;
        }
        let contacts_columns = [{
            field: 'first_name',
            title: 'First name',
        }, {
            field: 'middle_name',
            title: 'Middle name'
        }, {
            field: 'last_name',
            title: 'Last name',
        }, {
            field: 'phone_number',
            title: 'Phone number',
        }, {
            field: 'address_book',
            title: 'Address book',
            editComponent: this.editAddressBookComponent
        }];
        return (
            <div>
                {message}
                <MaterialTable
                    editable={{
                        isEditable: rowData => rowData.name === "a", // only name(a) rows would be editable
                        isDeletable: rowData => rowData.name === "b", // only name(a) rows would be deletable
                        onRowAdd: newData =>
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    {
                                        this.handleCreateContact(newData);
                                    }
                                    resolve();
                                }, 1000);
                            }),
                        onRowUpdate: (newData, oldData) =>
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    {
                                        /* const data = this.state.data;
                                        const index = data.indexOf(oldData);
                                        data[index] = newData;
                                        this.setState({ data }, () => resolve()); */
                                    }
                                    resolve();
                                }, 1000);
                            }),
                        onRowDelete: oldData =>
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    {
                                        /* let data = this.state.data;
                                        const index = data.indexOf(oldData);
                                        data.splice(index, 1);
                                        this.setState({ data }, () => resolve()); */
                                    }
                                    resolve();
                                }, 1000);
                            })
                    }}
                    isLoading={contacts_data['isFetching']}
                    title="Contacts"
                    columns={contacts_columns}
                    data={contacts}
                />
            </div>
        );
    }
}

AddressBook.propTypes = {
    sessionVariables: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    contacts_data: PropTypes.object.isRequired,
    address_books_data: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    function retrieveUrlData(url_var_name) {
        let url = sessionVariables[url_var_name] || '';
        return getUrlData(url, dataByUrl);
    }

    const {sessionVariables, dataByUrl} = state;
    const contacts_data = retrieveUrlData('contacts_url', dataByUrl);
    const address_books_data = retrieveUrlData('address_books_url', dataByUrl);

    return {
        sessionVariables,
        contacts_data,
        address_books_data
    }
}

export default connect(mapStateToProps)(withRouter(AddressBook))