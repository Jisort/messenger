import React, {Component, Fragment} from "react";
import MaterialTable from "material-table";
import {serverBaseUrl} from "../functions/baseUrls";
import {fetchDataIfNeeded, invalidateData, setSessionVariable} from "../actions/actions";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {extractResponseError, getUrlData} from "../functions/componentActions";
import {postAPIRequest} from "../functions/APIRequests";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import Select from "@appgeist/react-select-material-ui";
import {TextField} from "@material-ui/core";

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
        let selected_address_books = this.state.selected_address_book;
        let {first_name, middle_name, last_name, phone_number} = this.state;
        contact_data['first_name'] = first_name;
        contact_data['middle_name'] = middle_name;
        contact_data['last_name'] = last_name;
        contact_data['phone_number'] = phone_number;
        let book = [];
        let book_name = [];
        selected_address_books.forEach(function (selected_address_book) {
            if (selected_address_book['__isNew__']) {
                book_name.push(selected_address_book['value']);
            } else {
                book.push(selected_address_book['value']);
            }
        });
        contact_data['book_name'] = book_name.join(',');
        contact_data['book'] = book.join(',');
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
                const {sessionVariables, dispatch} = this.props;
                let address_books_url = sessionVariables['address_books_url'] || '';
                dispatch(invalidateData(address_books_url));
                dispatch(fetchDataIfNeeded(address_books_url));
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
            selected_address_book: book_object,
        });
    };

    editAddressBookComponent = (field) => {
        const {address_books_data} = this.props;
        let address_books = address_books_data['items'];
        let address_books_list = address_books.map(function (book) {
            return {
                value: book['id'],
                label: book['book_name'],
            }
        });
        return <Fragment>
            <Select
                id="value"
                label="Address book"
                options={address_books_list}
                value={this.state.selected_address_book}
                onChange={(value) => this.handleAddressBookChange(value)}
                isClearable
                isCreatable
                isMulti
            />
        </Fragment>
    }

    nameFieldComponent = (field) => {
        let column_def = field.columnDef;
        return <TextField type="text" label={column_def.title} name={column_def.field}
                          variant="outlined"
                          onChange={event => this.setState({
                              [column_def.field]: event.target.value
                          })}/>
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
            editComponent: this.nameFieldComponent
        }, {
            field: 'middle_name',
            title: 'Middle name',
            editComponent: this.nameFieldComponent
        }, {
            field: 'last_name',
            title: 'Last name',
            editComponent: this.nameFieldComponent
        }, {
            field: 'phone_number',
            title: 'Phone number',
            editComponent: this.nameFieldComponent
        }, {
            field: 'address_book',
            title: 'Address book',
            editComponent: this.editAddressBookComponent
        }, {
            field: 'carrier_region',
            title: 'Carrier',
            editable: 'never'
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
