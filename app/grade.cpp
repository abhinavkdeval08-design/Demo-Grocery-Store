#include<bits/stdc++.h>
using namespace std;
int main(){
    int x;
    cout << "Enter marks : ";
    cin >> x;
    if(x>=90 && x < 100){
        cout << "Grade : Ex";
    }
    else if(x>=80 && x < 90){
        cout << "Grade : A";
    }
    else if(x>=70 && x < 80){
        cout << "Grade : B";
    }
    else if(x>=60 && x < 70){
        cout << "Grade : C";
    }
    else if(x>=50 && x < 40){
        cout << "Grade : D";
    }
    else if(x>=33){
        cout << "Grade : P";
    }
    else {
        cout << "Grade : F";
    }
}