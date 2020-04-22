import React, {Component, Fragment} from "react";
import MaterialTable from "material-table";
import {serverBaseUrl} from "../functions/baseUrls";
import {fetchDataIfNeeded, invalidateData, setSessionVariable} from "../actions/actions";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {addressBookToPayload, extractResponseError, getUrlData} from "../functions/componentActions";
import {getAPIRequest, postAPIRequest} from "../functions/APIRequests";
import FormFeedbackMessage from "../components/FormFeedbackMessage";
import Select from "@appgeist/react-select-material-ui";
import {Fab, Grid, TextField, Box} from "@material-ui/core";
import {ImportContacts} from "@material-ui/icons";
import FormModal from "../components/FormModal";
import FormUploadContacts from "./UploadContacts";
import ActionPrompt from "../components/ActionPrompt";

class AddressBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: false,
            message_variant: 'info',
            message_text: null,
            upload_dialogue_open: false,
            delete_prompt_open: false,
            contacts_to_delete: [],
            activity: false
        }
        this.tableRef = React.createRef();
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

    handleGetContacts(resolve, page, page_size, search) {
        let query = `paginate=true&page=${page}&page_size=${page_size}&search=${search}`;
        let contacts_url = `${serverBaseUrl()}/messenger/contacts/?${query}`;
        getAPIRequest(
            contacts_url,
            (results) => {
                resolve(results);
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
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            }
        )
    }

    handleGetContactData = (contact_data) => {
        let selected_address_books = this.state.selected_address_book || [];
        let first_name = this.state.first_name || contact_data.first_name;
        let middle_name = this.state.middle_name || contact_data.middle_name;
        let last_name = this.state.last_name || contact_data.last_name;
        let phone_number = this.state.phone_number || contact_data.phone_number;
        contact_data['first_name'] = first_name;
        contact_data['middle_name'] = middle_name;
        contact_data['last_name'] = last_name;
        contact_data['phone_number'] = phone_number;
        let book_array = addressBookToPayload(selected_address_books);
        let book = book_array[0];
        let book_name = book_array[1];
        contact_data['book_name'] = book_name.join(',');
        contact_data['book'] = book.join(',');
        return contact_data;
    }

    handleSubmitContactData = (contact_data, contacts_url, method, action) => {
        postAPIRequest(
            contacts_url,
            () => {
                this.setState({
                    message: true,
                    message_text: `Contact ${action} successfully`,
                    message_variant: 'success',
                    activity: false,
                    delete_prompt_open: false
                });
                const {sessionVariables, dispatch} = this.props;
                let contacts_url = sessionVariables['contacts_url'] || '';
                let address_books_url = sessionVariables['address_books_url'] || '';
                dispatch(invalidateData(contacts_url));
                dispatch(fetchDataIfNeeded(contacts_url));
                dispatch(invalidateData(address_books_url));
                dispatch(fetchDataIfNeeded(address_books_url));
                this.handleRefreshContacts();
            },
            (results) => {
                let alert_message = extractResponseError(results);
                this.setState({
                    message: true,
                    message_text: alert_message,
                    message_variant: 'error',
                    activity: false,
                    delete_prompt_open: false
                });
                const {sessionVariables, dispatch} = this.props;
                let address_books_url = sessionVariables['address_books_url'] || '';
                dispatch(invalidateData(address_books_url));
                dispatch(fetchDataIfNeeded(address_books_url));
                this.handleRefreshContacts();
            },
            contact_data,
            {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.token
            },
            method
        )
    }

    handleContactUpdate = (contact_data) => {
        contact_data = this.handleGetContactData(contact_data);
        let contacts_url = `${serverBaseUrl()}/messenger/contacts/${contact_data.id}/`;
        this.handleSubmitContactData(contact_data, contacts_url, 'PUT', 'updated');
    }

    handleCreateContact = (contact_data) => {
        let contacts_url = serverBaseUrl() + '/messenger/contacts/';
        contact_data = this.handleGetContactData(contact_data);
        this.handleSubmitContactData(contact_data, contacts_url, 'POST', 'created');
    }

    handleDeleteContacts = (contacts_to_delete = null) => {
        this.setState({
            activity: true
        });
        if (!contacts_to_delete) {
            contacts_to_delete = this.state.contacts_to_delete;
        }
        let contacts_ids = [];
        let contacts_url = serverBaseUrl() + '/messenger/contacts/';
        contacts_to_delete.forEach(function (contact) {
            contacts_ids.push(contact['id']);
        });
        let contact_data = {
            delete: true,
            contacts_ids: contacts_ids.join(',')
        };
        this.handleSubmitContactData(contact_data, contacts_url, 'POST', 'deleted');
    };

    handleRefreshContacts = () => {
        this.tableRef.current && this.tableRef.current.onQueryChange();
    }

    handleAddressBookChange = (book_object) => {
        this.setState({
            selected_address_book: book_object,
        });
    };

    editAddressBookComponent = (field) => {
        const {address_books_data} = this.props;
        let row_data = field.rowData || {};
        let address_book_list = row_data['address_book_list'] || [];
        let selected_address_book = this.state.selected_address_book;
        let address_books = address_books_data['items'];
        if (!selected_address_book) {
            selected_address_book = [];
            address_books.forEach(function (book) {
                if (address_book_list.includes(book['id'])) {
                    selected_address_book.push({
                        value: book['id'],
                        label: book['book_name']
                    });
                }
            });
        }
        let address_books_list = address_books.map(function (book) {
            return {
                value: book['id'],
                label: book['book_name']
            }
        });
        return <Fragment>
            <Select
                id="value"
                label="Address book"
                options={address_books_list}
                value={selected_address_book}
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
                          defaultValue={field.value}
                          onChange={event => this.setState({
                              [column_def.field]: event.target.value
                          })}/>
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

    render() {
        const {address_books_data} = this.props;
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
                <Box>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Fab variant="extended" color="default" size="medium"
                                 onClick={() => this.handleOpenDialogue('upload_dialogue_open')}>
                                <ImportContacts color="primary"/>
                                upload contacts
                            </Fab>
                        </Grid>
                    </Grid>
                </Box>
                <Box mt={2} mb={8}>
                    <MaterialTable
                        tableRef={this.tableRef}
                        options={{
                            selection: true,
                            pageSizeOptions: [5, 10, 20, 50, 100, 200, 500, 1000],
                            exportButton: true
                        }}
                        actions={[
                            {
                                tooltip: 'Remove all selected contacts',
                                icon: 'delete',
                                onClick: (evt, data) => this.setState({
                                    delete_prompt_open: true,
                                    contacts_to_delete: data
                                })
                            }, {
                                icon: 'refresh',
                                tooltip: 'Refresh Data',
                                isFreeAction: true,
                                onClick: () => this.handleRefreshContacts(),
                            }
                        ]}
                        editable={{
                            isEditable: rowData => rowData.id > 0,
                            isDeletable: rowData => rowData.id > 0,
                            onRowAdd: newData =>
                                new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        this.handleCreateContact(newData);
                                        resolve();
                                    }, 1000);
                                }),
                            onRowUpdate: (newData, oldData) =>
                                new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        this.handleContactUpdate(newData);
                                        resolve();
                                    }, 1000);
                                }),
                            onRowDelete: oldData =>
                                new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        this.handleDeleteContacts([oldData])
                                        resolve();
                                    }, 1000);
                                })
                        }}
                        title="Contacts"
                        columns={contacts_columns}
                        data={query =>
                            new Promise((resolve, reject) => {
                                this.handleGetContacts(resolve, query.page, query.pageSize, query.search);
                            })
                        }
                    />
                </Box>
                <FormModal
                    handleClickOpen={() => this.handleOpenDialogue('upload_dialogue_open')}
                    handleClose={() => this.handleCloseDialogue('upload_dialogue_open')}
                    open={this.state.upload_dialogue_open}
                    title="Upload contacts"
                >
                    <FormUploadContacts
                        handleClose={() => this.handleCloseDialogue('upload_dialogue_open')}
                        tableRef={this.tableRef}
                    />
                </FormModal>
                <ActionPrompt
                    open={this.state.delete_prompt_open}
                    title={`Delete ${this.state.contacts_to_delete.length} contacts?`}
                    content="Deleted contacts will be permanently removed from your account"
                    handleAgree={() => this.handleDeleteContacts()}
                    handleDisagree={() => this.handleCloseDialogue('delete_prompt_open')}
                    activity={this.state.activity}
                />
            </div>
        );
    }
}

AddressBook.propTypes = {
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

export default connect(mapStateToProps)(withRouter(AddressBook))
