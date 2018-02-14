import React from 'react';

export default props => {

    const messagesList = props.data.map((item, index) => {
        return <li key={index}>{item}</li>
    });

    console.log(messagesList);
    return (
        <ul> {messagesList} </ul>
    );
}