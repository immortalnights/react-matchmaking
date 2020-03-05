import React from 'react';
import { A } from 'hookrouter';

export const withLoader = (WrapperComponent, makeRequest) => {
	return class Loader extends React.Component {
		state = {
			status: 'LOADING',
			error: null,
			data: null
		};

		request = null;

		componentDidMount()
		{
			this.request = makeRequest(this.props.id).then(({ status, error, data }) => {
				this.request = null;
				this.setState({ status, error, data });
			});
		}

		componentWillUnmount()
		{
			if (this.request)
			{
				this.request.cancel();
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
				case 'ERROR':
				{
					content = (<>
						<h1>{this.state.error}</h1>
						<A href="/">Return</A>
					</>);
					break;
				}
				default:
				{
					content = (<WrapperComponent {...this.props} data={this.state.data} />);
					break;
				}
			}

			return content;
		}
	}
};
