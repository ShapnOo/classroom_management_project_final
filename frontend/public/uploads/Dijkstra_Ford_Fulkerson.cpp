#include <iostream>
#include <vector>
#include <queue>
using namespace std;

// Academic Lab: Dijkstra Shortest Path
const int INF = 1e9;
void dijkstra(int src, const vector<vector<pair<int, int>>>& adj, vector<int>& dist) {
    dist[src] = 0;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}
int main() {
    cout << "Algorithm Analysis & Design Shortest Path Matrix Loaded." << endl;
    return 0;
}
