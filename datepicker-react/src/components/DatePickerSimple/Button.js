import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
    background: #46ACF7;
    border: none;
    border-radius: 3px;
    color: #fff;
    cursor: pointer;
    height: 40px;
    font-size: 14px;
    font-weight: 300;
    margin: 8px;
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