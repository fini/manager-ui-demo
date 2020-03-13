import React, { useState, useEffect } from "react"
import axios from "axios"

export const FilteredInputField = (props) => {

    const [isLoaded, setIsLoaded] = useState(false)
    const [statusMessage, setStatusMessage] = useState("Loading, stand by...")
    const [employees, setEmployees] = useState([])
    const [selectedEmployee, setSelectedEmployee] = useState()
    const [filteredItems, setFilteredItems] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [resultsHidden, setResultsHidden] = useState(true)
    const [dataUrl, setDataUrl] = useState(props.dataUrl)

    useEffect(() => {
        axios
            .get(dataUrl)
            .then(({ data }) => {
                // Incoming data needs to be organized a bit, 
                // because of an extra included payload, with mixed object types, and duplicate id's.
                // var perfectWorldMergedData = [...data.data, ...data.included]

                // First we include all the Employee items from 'data.data'...
                var employeesData = (data.data.filter(item => item.type === 'employees'))

                // Then we go through the items in 'data.included', and add only Employee items, that have a uniqe id.
                data.included.forEach(newItem => {
                    if ( employeesData.find(item => item.id === newItem.id && newItem.type === 'employees')) {
                        console.warn('Found duplicate id (', newItem.id, ') entry of same type (', newItem.type, ') skipping item...')
                    } else if (newItem.type === 'employees') {
                        employeesData.push(newItem)
                    }
                })

                // Now we basically do the same for Accounts items,
                // In the current state of the incomming data, this is not needed, but for safety measures, we assume there could be Accounts items in 'data.data'.
                // First we include all the Accounts items from 'data.data'...
                var accountsData = (data.data.filter(item => item.type === 'accounts'))

                // Then we go through the items in 'data.included', and add only Account items, that have a uniqe id.
                data.included.forEach(newItem => {
                    if ( accountsData.find(item => item.id === newItem.id && newItem.type === 'accounts')) {
                        console.warn('Found duplicate id (', newItem.id, ') entry of same type (', newItem.type, ') skipping item...')
                    } else if (newItem.type === 'accounts') {
                        accountsData.push(newItem)
                    }
                })

                // Go through each Employee, and attempt to collect an associated account email.
                // In a larger setup, we might want to use the account data for other things,
                // But in this demo, we just need very little from the Account items (email), so we just add it directly to the Employee item.
                employeesData.forEach(item => {
                    var linkedAccount = accountsData.find(accountItem => accountItem.id === item.relationships.account.data.id)
                    item.attributes.email = linkedAccount ? linkedAccount.attributes.email : 'n/a'
                })

                setEmployees(employeesData);
                setFilteredItems(employeesData)
                setIsLoaded(true)
            })
            .catch((error) => {
                // Error
                setStatusMessage('Error: Data Load Failed...')
                if (error.response) {
                    console.warn(error.response)
                    setStatusMessage('Response Error: ' + error.response.data)
                } else if (error.request) {
                    console.warn('Request Failed', error.request)
                } else {
                    console.warn('Error', error.message)
                }
                console.log('Error Details', error.config)
            });;
    }, [dataUrl]);


    const updateResult = (query) => {

        setFilteredItems(employees.filter(item => {            
            // Create a single query string, that will allow case insensitive searching on initials, across words etc.
            let {firstName, lastName, name} = item.attributes;

            // bonus: also search for initials (JD || DJ ==> 'John Doe')
            var avatarCode = firstName.charAt(0) + lastName.charAt(0)
            var simpleQuery = (avatarCode + name + name).toLowerCase().replace(' ', '')
            return simpleQuery.indexOf(query.toLowerCase()) > -1
        }))
    }

    // Handles the onChange handler for the search field.
    // @todo Consider using debouncer, if used on server-side queried data or large datasets.
    const changeHandler = (e) => {
        var query = e.target.value
        setSearchQuery(query)
        updateResult(query)
    }

    const handleItemClick = (item) => {
        setSelectedEmployee(item)
        setResultsHidden(true)
        setSearchQuery(item.attributes.name)
        updateResult(item.attributes.name)
        console.info('Item selected', item)
    }

    const handleClear = () => {
        setSearchQuery("")
        setResultsHidden(true)
        updateResult("")
        setSelectedEmployee(null)
    }

    const handleOpen = () => {
        if (resultsHidden) {
            setResultsHidden(false)
        } else {
            setResultsHidden(true)
        }
    }

    // These styles, control visibility of elements, @todo: make this smarter.
    var resultsStyle = {
        display: (resultsHidden ? 'none' : '')
    };

    var clearBtnStyle = {
        display: (searchQuery === '' ? 'none' : '')
    };

    var openBtnStyle = {
       // display: (searchQuery !== '' ? 'none' : '')
    };    

    return (
        <div className="input-group filtered-input">

            <label htmlFor={props.name}>{props.title}</label>

            <div className="input-field-frame">
                <input className="input-field"
                    value={searchQuery}
                    name={props.name}
                    id={props.name}
                    placeholder={(isLoaded) ? props.placeholder : statusMessage}
                    onChange={changeHandler}
                    onFocus={() => { setResultsHidden(false) }}
                    //onBlur={() => { setResultsHidden(true) }}
                />

                <button title="Open Selector" className="btn-open" onClick={handleOpen} style={openBtnStyle}><span role="img" aria-label="Find">🔎</span></button>
                <button title="Clear field" className="btn-clear" onClick={handleClear} style={clearBtnStyle}><span role="img" aria-label="Clear">❌</span></button>
            </div>

            <div className="results" style={resultsStyle}>
                <ul>
                    {filteredItems && filteredItems.map(item => (
                    <li key={item.id} className="item">
                        <a className="item-link" href={ '#' + item.id} onClick={(e) => { e.preventDefault(); handleItemClick(item); }}>
                            <span className="avatar">{item.attributes.firstName.charAt(0)}{item.attributes.lastName.charAt(0)}</span>
                            <span>{item.attributes.name}</span>
                            <div className="email">{item.attributes.email}</div>
                        </a>
                    </li>
                    ))}
                </ul>
            </div>

        </div>
    )
}

export default FilteredInputField