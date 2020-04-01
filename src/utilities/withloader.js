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
					content = (<h1>Connecting...</h1>);
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
					content = (<div>
						<h1>Error</h1>
						<h2>{this.state.error}</h2>
						<A href="/">Return</A>
					</div>);
					break;
				}
			}

			return content;
		}
	}
};
