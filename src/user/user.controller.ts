import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response , Request} from 'express';
import { JwtService } from '@nestjs/jwt';


@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService, private jwtService: JwtService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    // const {password, ...result} = user;
    // return result;
    return user;
  }

  @Post('login')
  async login(@Body('username') username: string , @Body('password') password: string, @Res( {passthrough: true} ) response: Response){

    const user = await this.userService.login(username,password);

    const jwt = await this.jwtService.signAsync({id: user.id})
    response.cookie('jwt', jwt, {httpOnly: true})
    return {message: "Successfull Login", jwt};

  }
  

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      if(!data){
        throw new UnauthorizedException()
      }
      const user = await this.userService.findOne(+id);
      // const {password, ...result} = user;
      // return result;
      return user
    } catch (error) {
      throw new UnauthorizedException()
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      if(!data){
        throw new UnauthorizedException()
      }
      const user = await this.userService.update(+id, updateUserDto);
      // const {password, ...result} = user;
      // return result;
      return user
    } catch (error) {
      throw new UnauthorizedException()
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);
      if(!data){
        throw new UnauthorizedException()
      }
      return await this.userService.remove(+id);
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
