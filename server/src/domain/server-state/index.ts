class ServerState {

	private static _instance: any;
	public static get instance() {

		class InternalSingleton {
			private controllersCompletion: [] = []
			//more singleton logic

			public updateControllersCompletion(controllersFound: []) {
				this.controllersCompletion = controllersFound;
			}

			public getControllersCompletion() {
				return this.controllersCompletion;
			}
		}

		if (!ServerState._instance) {
			ServerState._instance = new InternalSingleton();
		}

		return <InternalSingleton>ServerState._instance;
	}
}

export default ServerState;