habla(juan, ruso).
habla(juan, inglés).
habla(maría, inglés).
habla(pedro, ruso).

hablaCon(A, B) :- habla(A, I), habla(B, I), A \= B.
interprete(A, P, Q) :- hablaCon(A, P), hablaCon(A, Q), P \= Q.

% ?- habla(A, I), habla(B, I).
