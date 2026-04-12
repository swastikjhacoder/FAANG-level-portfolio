export const costAnalysisPlugin = (maxCost = 1000) => ({
  async requestDidStart() {
    let cost = 0;

    return {
      executionDidStart() {
        return {
          willResolveField({ info }) {
            cost += 1;

            if (cost > maxCost) {
              throw new Error("Query cost exceeded limit");
            }
          },
        };
      },
    };
  },
});
