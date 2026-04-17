"use client";

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
          <h2 className="text-xl font-semibold text-red-500">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {this.state.error?.message || "Unexpected error occurred"}
          </p>

          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:opacity-80"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
