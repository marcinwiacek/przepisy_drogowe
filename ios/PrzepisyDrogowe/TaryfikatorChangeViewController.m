//
//  TaryfikatorChangeViewController.m
//  PrzepisyDrogowe
//
//  Created by Marcin on 11/8/12.
//  Copyright (c) 2012 Marcin. All rights reserved.
//

#import "TaryfikatorChangeViewController.h"
#import "AppDelegate.h"

@interface TaryfikatorChangeViewController ()

@end

@implementation TaryfikatorChangeViewController


@synthesize menuArray= _menuArray;
@synthesize taryfikatorChangeTableView = taryfikatorChangeTableView;
@synthesize taryfikatorChangeLabel = taryfikatorChangeLabel;
@synthesize taryfikatorChangeNavigationBar = taryfikatorChangeNavigationBar;
@synthesize nr_akt = nr_akt;
@synthesize nr_rozdzial = nr_rozdzial;

-(IBAction)taryfikatorChangeButtonClicked:(id)sender {
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    if (nr_akt!=appDelegate.controllertaryfikator.nr_akt || nr_rozdzial!=appDelegate.controllertaryfikator.nr_rozdzial) {
        [appDelegate.controllertaryfikator.taryfikatorLabel setText:[self.menuArray objectAtIndex:nr_akt]];
        appDelegate.controllertaryfikator.nr_akt = nr_akt;
        appDelegate.controllertaryfikator.nr_rozdzial = nr_rozdzial;
        
        [self dismissViewControllerAnimated:YES completion: nil];
        
        [appDelegate.controllertaryfikator display];
    } else {
        [self dismissViewControllerAnimated:YES completion: nil];
    }
}

-(IBAction)taryfikatorExitButtonClicked:(id)sender {
    [self dismissViewControllerAnimated:YES completion: nil];
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        self.edgesForExtendedLayout=UIRectEdgeNone;
        [self prefersStatusBarHidden];
    }
    
    self.menuArray = [[NSArray alloc]
                      initWithObjects:@"(do 31.12.2021) Mandaty i punkty razem (opracowanie własne)",
                      @"Mandaty i punkty osobno (od 1.1.2022, Rozp.)",
                      @"Mandaty i punkty osobno (10.08.2017-31.12.2021, Rozp.)",
                
                      @"Mandaty i punkty osobno (11.04.2015-09.08.2017, Rozp.)" ,                     @"Mandaty i punkty osobno (09.06.2012-10.04.2015, Rozp.)",
                      @"Mandaty i punkty osobno (24.05.2011-08.06.2012, Rozp.)",nil];
    
    AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
    nr_akt = appDelegate.controllertaryfikator.nr_akt;
    nr_rozdzial = appDelegate.controllertaryfikator.nr_rozdzial;
    
    if (nr_akt==0 && nr_rozdzial!=-1) {
        [self.taryfikatorChangeTableView selectRowAtIndexPath:[NSIndexPath indexPathForRow:nr_rozdzial inSection:1] animated:NO scrollPosition:UITableViewScrollPositionTop ];
        [self.taryfikatorChangeTableView deselectRowAtIndexPath:[NSIndexPath indexPathForRow:nr_rozdzial inSection:1] animated:NO];
    } else {
        [self.taryfikatorChangeTableView selectRowAtIndexPath:[NSIndexPath indexPathForRow:nr_akt inSection:0] animated:NO scrollPosition:UITableViewScrollPositionTop ];
        [self.taryfikatorChangeTableView deselectRowAtIndexPath:[NSIndexPath indexPathForRow:nr_akt inSection:0] animated:NO];
    }
    
    CGRect frame = CGRectMake(0, 0, 4000, 44);
    taryfikatorChangeLabel = [[UILabel alloc] initWithFrame:frame];
    taryfikatorChangeLabel.backgroundColor = [UIColor clearColor];
    taryfikatorChangeLabel.font = [UIFont boldSystemFontOfSize:14.0];
    taryfikatorChangeLabel.numberOfLines = 2;
    taryfikatorChangeLabel.textAlignment = NSTextAlignmentCenter;
    if ([[[UIDevice currentDevice] systemVersion]floatValue]>=7.0) {
        taryfikatorChangeLabel.textColor = [UIColor blackColor];
    } else {
        taryfikatorChangeLabel.textColor = [UIColor whiteColor];
    }
    
    taryfikatorChangeLabel.text = @"Zakładka \"Treść\"";
    
    
    self.taryfikatorChangeNavigationBar.topItem.titleView = taryfikatorChangeLabel;
}

-(void) viewWillAppear:(BOOL)animated{
    
}


#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    if (nr_akt==0) {
        AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
        if (appDelegate.controllertaryfikator.nr_akt!=0) {
            return 1;
        }
        if ([appDelegate.mojTaryfikatorRozdzial count]==0) {
            return 1;
        };
        
        return 2;
    }
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if (section==0) {
        return 6;
    }
    if (nr_akt==0) {
        AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
        return [appDelegate.mojTaryfikatorRozdzial count];
    }
    
    return 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
        
    }
    
    if (indexPath.section==0) {
        NSString *cellValue = [self.menuArray objectAtIndex:indexPath.row];
        cell.textLabel.text = cellValue;
        if (nr_akt==indexPath.row) {
            cell.accessoryType = UITableViewCellAccessoryCheckmark;
        } else {
            cell.accessoryType = UITableViewCellAccessoryNone;
        }
    } else {
        
        AppDelegate *appDelegate= (AppDelegate *)[[UIApplication sharedApplication] delegate];
        NSString *cellValue = [appDelegate.mojTaryfikatorRozdzial objectAtIndex:indexPath.row];
        cell.textLabel.text = cellValue;
        if (nr_rozdzial==indexPath.row) {
            cell.accessoryType = UITableViewCellAccessoryCheckmark;
        } else {
            cell.accessoryType = UITableViewCellAccessoryNone;
        }
    }
    
    cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
    cell.textLabel.numberOfLines=0;
    
    return cell;
}



#pragma mark - Table view delegate

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if (section ==0) {
        NSString *title = @"Pokazywany widok";
        return title;
    }
    NSString *title = @"Wyróżniony rozdział";
    return title;
};

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section==0) {
        nr_akt=indexPath.row;
        nr_rozdzial =-1;
        [self.taryfikatorChangeTableView reloadData];
    } else {
        if (nr_rozdzial!=-1) {
            NSIndexPath *oldpath = [NSIndexPath indexPathForRow:nr_rozdzial inSection:1];
            [[self.taryfikatorChangeTableView cellForRowAtIndexPath:oldpath] setAccessoryType:UITableViewCellAccessoryNone];
        }
        nr_rozdzial=indexPath.row;
        [[self.taryfikatorChangeTableView cellForRowAtIndexPath:indexPath] setAccessoryType:UITableViewCellAccessoryCheckmark];
        
        [self.taryfikatorChangeTableView deselectRowAtIndexPath:indexPath animated:YES];
    }
}

@end
