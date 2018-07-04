import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
    background: #8E54E9;
    border: none;
    color: #fff;
    cursor: pointer;
    height: 44px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    width: 100%;
`;

const Button = ({ selectedDate, submitDate }) => {
    const displayDate = selectedDate.format('MMM Do YYYY');

    return (
        <StyledButton onClick={() => submitDate()}>
            {`Click to Confirm (${displayDate})`}
        </StyledButton>
    )
}

export default Button;