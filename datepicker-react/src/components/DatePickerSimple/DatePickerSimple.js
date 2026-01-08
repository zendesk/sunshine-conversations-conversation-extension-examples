import React, { Component } from "react";
import DatePicker from "react-datepicker"; // https://reactdatepicker.com/ for options and settings.
import { Helmet } from "react-helmet";
import qs from "qs";
import moment from "moment";
import Button from "./Button";
import "react-datepicker/dist/react-datepicker.css"; // Base styling for Calendar
import "./DatePickerSimple.css"; // Custom Styling for Calendar

class DatePickerSimple extends Component {
  constructor() {
    super();
    const receivedParameters = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });

    this.state = {
      selectedDate: new Date(),
      userId: receivedParameters.userId,
      conversationId: receivedParameters.conversationId,
    };
  }
  componentDidMount() {
    // webviewSdk script is added in index.html and initialized here.
    // eslint-disable-next-line
    window.webviewSdkInit;
  }
  handleChange = (date) => {
    this.setState({
      selectedDate: date,
    });
  };
  submitDate = () => {
    const { server } = this.props;
    const { selectedDate, userId, conversationId } = this.state;
    fetch(`${server}/date`, {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log(
          response,
          `Submitted ${moment(selectedDate).format(
            "MMM Do YYYY"
          )} for user(${userId}) in conversation(${conversationId})`
        );
        window.WebviewSdk.close();
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { selectedDate } = this.state;

    return (
      <div id="datepicker-simple">
        <Helmet title={"Select Date"} />
        <DatePicker
          inline
          minDate={new Date()}
          selected={selectedDate}
          onChange={(date) => this.handleChange(date)}
        />
        <div className="nav">
          <Button selectedDate={selectedDate} submitDate={this.submitDate} />
        </div>
      </div>
    );
  }
}

export default DatePickerSimple;
