import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormActivityIndicator from "./FormActivityIndicator";

export default class AlertDialog extends Component {

    render() {
        let prompt_actions_buttons = <DialogActions>
            <Button onClick={this.props['handleAgree']} color="primary">
                Yeah, sure
            </Button>
            <Button onClick={this.props['handleDisagree']} color="primary" autoFocus>
                No
            </Button>
        </DialogActions>;
        if (this.props.activity) {
            prompt_actions_buttons = <FormActivityIndicator/>;
        }
        return (
            <div>
                <Dialog
                    open={this.props.open}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {this.props.content}
                        </DialogContentText>
                    </DialogContent>
                    {prompt_actions_buttons}
                </Dialog>
            </div>
        );
    }
}
