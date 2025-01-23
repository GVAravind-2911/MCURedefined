def solution(S, T):
    A = list(S)
    B = list(T)
    n = len(S)
    swaps = 0
    mindiff = abs(int(S) - int(T))
    
    while True:
        best_diff = mindiff
        best_i = -1
        for i in range(n):
            if A[i] == B[i]:
                continue
            A_temp = A.copy()
            B_temp = B.copy()
            A_temp[i], B_temp[i] = B_temp[i], A_temp[i]
            new_diff = abs(int(''.join(A_temp)) - int(''.join(B_temp)))
            if new_diff < best_diff:
                best_diff = new_diff
                best_i = i
        if best_i == -1 or best_diff >= mindiff:
            break
        else:
            A[best_i], B[best_i] = B[best_i], A[best_i]
            mindiff = best_diff
            swaps += 1

    return swaps

S = "997"
T = "623"
print(solution(S, T))