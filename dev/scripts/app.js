import React from 'react';
import ReactDOM from 'react-dom';
import {ajax} from "jquery";
import {
    BrowserRouter as Router,
    NavLink as Link,
    Route
} from "react-router-dom";

var config = {
  apiKey: "AIzaSyBP3X83iCtIGjMKwq98hCC4PdG8bA64m70",
  authDomain: "ball-center.firebaseapp.com",
  databaseURL: "https://ball-center.firebaseio.com",
  projectId: "ball-center",
  storageBucket: "ball-center.appspot.com",
  messagingSenderId: "524214910112"
};
firebase.initializeApp(config);

const dbRef = firebase.database().ref('/');

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();



class Auth extends React.Component{
	render() {
		if (this.props.loggedIn) {
			return(
				<div>
					<button id="logoutButton" className="logoutButton" onClick={this.props.logout}>Log Out</button>
					<button className="addButton" onClick={this.props.reveal}>Ball Up</button>
				</div>
			) 
		} else {
			return (
				<div>
					<button id="loginButton" className="loginButton" onClick={this.props.login}>Log In</button>
				</div>
			)
		}
	}
}
class Listing extends React.Component{
	render() {
		return(
			<div className="list">
				<div className="smallList">
				{this.props.listing.map((l) => {
					const randomNumber = Math.floor(Math.random() * 30 ) + 1;
					const removeButton = () => {
						if (this.props.loggedIn === true) {
							return <button className="removeButton" onClick={() => this.props.remove(l.key)}>Remove</button>
						}
					}
					return (<div className='item' id="item" key={l.key} style={ {background: `url('public/assets/${randomNumber}.jpg') center/cover`} }>
						<p className="statusItem">Status: Need {l.count} player(s)</p>
						<p>{l.name}</p>
						<p>{l.location}</p>
						<p className="dateItem">{l.date}</p>
						<p className="timeItem">{l.time}</p>
						<p className="textItem">{l.text}</p>
						<button className="attendButton" id="attendButton" onClick={() => this.props.attend(l.count, l.key)}>RSVP</button>
						{removeButton()}
					</div>)
				})}
				</div>
			</div>
		)
	}
}
class App extends React.Component {
	constructor() {
		super();
		this.state = {
			loggedIn: false,
			user: null,
			listing: []
		}
		this.handleChange = this.handleChange.bind(this);
		this.create = this.create.bind(this);
		this.remove = this.remove.bind(this);
		this.attend = this.attend.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
	}
	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
	create(e){
		e.preventDefault();

		const listingDetails = {
			name: this.state.name,
			location: this.state.location,
			date: this.state.date,
			time: this.state.time,
			count: this.state.count,
			text: this.state.text
		}
		if (name==="" || name===null, location==="" || location===null) {
			alert("Fill all required fields");
		} else {
			dbRef.push(listingDetails);
			this.reveal();
		}
	}
	remove(key) {
		const listItem = firebase.database().ref(key)
		listItem.remove();
	}
	attend(ppl, eventKey) {
		let bodies = prompt('How many people total?');
		const countRef = firebase.database().ref(`/${eventKey}/count`);
		
		ppl = parseInt(ppl)

		if (bodies > ppl) {
			alert('Too many people')
		} else if (bodies == ppl) {
			const listItem = firebase.database().ref(eventKey)
			countRef.set(ppl - bodies)
			document.getElementById('attendButton').style.display = 'none';
		} else if (bodies < 0) {
			alert('Invalid')
		} else {
			countRef.set(ppl - bodies)		
		}
	}
	reveal() {
		var x = document.getElementById('formContainer');
		x.classList.toggle('show');
	}
	login() {
		auth.signInWithPopup(provider)
			.then((result) => {
				const user = result.user;
				// console.log(user);
				this.setState({
					user: user,
					loggedIn: true,
				})
			})
	}
	logout() {
		auth.signOut()
			.then(() => {
				this.setState({
					user: null,
					loggedIn: false,
				});
			});
	}
    render() {
      return (
        <div>
   		<header>
	        <h1>Ball Center</h1>
	        <p>Killer crossover? Smooth jumper? Elite finisher? Slick handles?</p>
	        <p>Bring Your Game</p>
			<Auth loggedIn={this.state.loggedIn} login={this.login} logout={this.logout} reveal={this.reveal}/>
    	</header>

		<div className="formContainer" id="formContainer">
			<button className="close" onClick={this.reveal}>X</button>
			<form className="addListing" onSubmit={this.create}>
				<p>Create a Listing</p>
				<input name="name" onChange={this.handleChange} placeholder="Enter Name" />
				<input name="location"  onChange={this.handleChange} placeholder="Enter Address"/>
				<input type="date" name="date" onChange={this.handleChange}/>
				<input type="time" name="time"  onChange={this.handleChange}/>
				<input type="number" name="count"  onChange={this.handleChange} placeholder="How many people do you need?" min="1" max="20"/>
				<input type="text" maxLength="25" name="text"  onChange={this.handleChange} placeholder="Additional details" />
				<input type="submit" value="Submit Listing"/>
			</form>
		</div>

        <div className="listingContainer">
			<Listing listing={this.state.listing} remove={this.remove} attend={this.attend} loggedIn={this.state.loggedIn} />
     	</div>

        </div>
      )
    }
    componentDidMount(){
    	const userRef = firebase.database().ref('/');

    	userRef.on('value', (snapshot) => {
    		const dbInfo = snapshot.val();
			var listing = [];

    		for (let key in dbInfo) {

    			listing.push({
					key: key,
					name: dbInfo[key].name,
					location: dbInfo[key].location,
					date: dbInfo[key].date,
					time: dbInfo[key].time,
					count: dbInfo[key].count,
					text: dbInfo[key].text,
    			});
    		}
    		this.setState({
    			listing
    		});
    	});
    }
}

ReactDOM.render(<App />, document.getElementById('app'));

