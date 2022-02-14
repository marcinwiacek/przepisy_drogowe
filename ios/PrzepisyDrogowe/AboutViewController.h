//
//  AboutViewController.h
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/22/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

@interface AboutViewController : UIViewController<WKNavigationDelegate> {
    IBOutlet WKWebView *aboutWebView;
    UIActivityIndicatorView *spinner;
    IBOutlet UINavigationBar *aboutNavigationBar;
    IBOutlet UILabel *aboutLabel;
    IBOutlet UIBarButtonItem *aboutMailButton;
}


-(IBAction)AboutExitClicked:(id)sender;
-(IBAction)AboutEmailClicked:(id)sender;

@property(nonatomic,retain) IBOutlet WKWebView *aboutWebView;
@property(nonatomic,retain) IBOutlet UINavigationBar *aboutNavigationBar;
@property(nonatomic,retain) IBOutlet UILabel *aboutLabel;
@property(nonatomic,retain) IBOutlet UIBarButtonItem *aboutMailButton;

@end
