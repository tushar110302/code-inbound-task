import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteResult, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private jwtService: JwtService){}

  async create(createUserDto: CreateUserDto){
    const user: User = new User();
    user.email = createUserDto.email;
    user.username = createUserDto.username;
    user.password = createUserDto.password;
    const exists = await this.userRepository.findOneBy({username: user.username});
    if(exists){
      console.log(exists)
      throw new BadRequestException("User already exists with this username")
    }
    return await this.userRepository.save(user);
  }

  async login(username: string, password: string){
    const user = await this.userRepository.findOneBy({username: username});
    if(!user){
      throw new BadRequestException("User does not exist");
    }
    if(password!== user.password){
      throw new BadRequestException("Invalid Password")
    }
    
    console.log(user);
    return user;
  }
  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const exists = await this.userRepository.findOneBy({id});

    if(!exists){
      throw new BadRequestException("User does not exist")
    }
    return exists;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user: User = new User();
    user.email = updateUserDto.email;
    user.username = updateUserDto.username;
    user.password = updateUserDto.password;
    user.id = id;
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<DeleteResult> {
    const exists = await this.userRepository.findOneBy({id});

    if(!exists){
      throw new BadRequestException("User does not exist")
    }
    return await this.userRepository.delete(id);
  }
}
