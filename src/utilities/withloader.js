import React from 'react';
import { A } from 'hookrouter';

export const withLoader = (WrapperComponent, makeRequest) => {
	return class Loader extends React.Component {
		state = {
			status: 'LOADING',
			error: null,
			data: null
		};

		componentDidMount()
		{
			return makeRequest(this.props.id)
			.then(({ status, error, data }) => {
				this.setState({ status, error, data });
			});
		}

		componentWillUnmount()
		{
			if (window.AbortController)
			{
				const controller = new AbortController();
				const signal = controller.signal;
				controller.abort();
			}
		}

		render()
		{
			let content;

			switch (this.state.status)
			{
				case 'LOADING':
				{
					content = (<div className="status-message information"><h2>Connecting...</h2></div>);
					break;
				}
				case 'OK':
				{
					content = (<WrapperComponent {...this.props} {...this.state.data} />);
					break;
				}
				case 'ERROR':
				default:
				{
					content = (<div className="status-message error">
						<h2>Error</h2>
						<h3>{this.state.error}</h3>
						<A href="/">Return</A>
					</div>);
					break;
				}
			}

			return content;
		}
	}
};
