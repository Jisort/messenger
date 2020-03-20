import React from 'react';
import MomentUtils from '@date-io/moment';
import {
    DateTimePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';

export default function App(props) {
    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <DateTimePicker
                InputProps={{
                    readOnly: props['readOnly'],
                }}
                onChange={props['onChange']}
                maxDate={props['maxDate']}
                value={props['value']}
                format={props['format']}
                label={props['label']}
                fullWidth={props['fullWidth']}
            />
        </MuiPickersUtilsProvider>
    );
}
