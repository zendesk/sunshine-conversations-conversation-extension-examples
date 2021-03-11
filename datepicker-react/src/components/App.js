import React, { Component } from 'react';
import Smooch from 'smooch';
import styled from 'styled-components';

const StyledButton = styled.button`
    color: rgb(255, 255, 255);
    cursor: pointer;
    font-weight: 400;
    box-shadow: rgba(63, 49, 178, 0.1) 0px 2px 4px, rgba(63, 49, 178, 0.03) 0px 4px 14px;
    background-color: rgb(163, 71, 183);
    outline: none;
    margin-bottom: 0;
    text-align: center;
    vertical-align: middle;
    white-space: nowrap;
    padding: 7px 20px;
    font-size: 16px;
    line-height: 1.5;
    border-radius: 4px;
`;

class App extends Component {
    componentDidMount() {
        const { server } = this.props;

        fetch(`${server}/integrationId`, {
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        }).then(res => {
            return res.json();
        }).then(data => {
            this.integrationId = data.integrationId;
        }).catch(err => console.log('fetch Error: ', err));
    }

    activateMessenger = () => {
        Smooch.init({
            integrationId: this.integrationId,
            customColors: {
                brandColor: '46ACF7',
                conversationColor: '19A661'
            }
        }).then(() => {
            Smooch.open();
        });
    }

    render() {
        return (
            <div>
                <h1>Conversation Extension Example</h1>
                <h2>Date Picker</h2>
                <p>To trigger conversation-extension write a message that contains one of the following expressions:</p>
                <ul>
                    <li>"choose date"</li>
                </ul>
                <StyledButton onClick={this.activateMessenger}>Activate Web Messenger</StyledButton>
                <p><em>Change these expressions and/or add more in the <a href="https://github.com/smooch/conversation-extension-examples/blob/master/hotel-booking/intents.js">intents.js</a> file.</em></p>
                <p>More examples are available on Gihtub (<a href="https://github.com/smooch/conversation-extension-examples">https://github.com/smooch/conversation-extension-examples</a>)</p>
            </div>
        );
    }
}

export default App;
