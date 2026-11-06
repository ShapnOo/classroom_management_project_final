"""
Academic Lab: Two-Layer Neural Network Backpropagation
Department of Computer Science & Engineering
"""
import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def forward_propagation(X, W1, b1, W2, b2):
    Z1 = np.dot(W1, X) + b1
    A1 = np.tanh(Z1)
    Z2 = np.dot(W2, A1) + b2
    A2 = sigmoid(Z2)
    return {"Z1": Z1, "A1": A1, "Z2": Z2, "A2": A2}

print("Neural Network Backpropagation Matrix Initialized.")
