import React, { Component } from 'react';
import DatePicker from 'react-datepicker'; // https://reactdatepicker.com/ for options and settings.
import qs from 'qs';
import moment from 'moment';
import Button from  './Button';
import 'react-datepicker/dist/react-datepicker.css'; // Base styling for Calendar
import './DatePickerSimple.css'; // Custom Styling for Calendar

class DatePickerSimple extends Component {
    constructor() {
        super();
        const receivedParameters = qs.parse(window.location.search, { ignoreQueryPrefix: true });

        this.state = {
            selectedDate: moment(),
            userId: receivedParameters.userId
        }
    }
    componentDidMount() {
        // webviewSdk script is added in index.html and initialized here.
        window.webviewSdkInit;
    }
    handleChange = (date) => {
        this.setState({
            selectedDate: date
        });
    }
    submitDate = () => {
        const { server } = this.props;
        const { selectedDate, userId } = this.state;
        fetch(`${server}/date`, {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log(response, `Submitted ${selectedDate.format('MMM Do YYYY')} for user(${userId})`);
            window.WebviewSdk.close();
        })
        .catch(err => console.log(err));
    }

    render() {
        const { selectedDate, userId } = this.state;

        return (
            <div id="datepicker-simple">
                <DatePicker
                    inline
                    minDate={moment()}
                    selected={selectedDate}
                    onChange={date => this.handleChange(date)}
                />
                <Button
                    selectedDate={selectedDate}
                    submitDate={this.submitDate}
                />
            </div>
        )
    }  
};

export default DatePickerSimple;